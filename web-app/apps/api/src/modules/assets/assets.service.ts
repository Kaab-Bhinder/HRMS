import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, AssetStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CustomFieldValidatorService } from '../custom-fields/custom-field-validator.service';
import { AssignAssetDto, CreateAssetDto, ReturnAssetDto, UpdateAssetDto } from './dto/asset.dto';

/**
 * Company property registry with an issue/return audit trail.
 *
 * The Asset row is identity + purchase facts + a denormalized pointer to the
 * CURRENT holder; AssetAssignment records every hand the asset passed through
 * (who, when, condition out / condition in). Offboarding and audits read the
 * history, not the pointer. Status discipline is enforced here, not in the UI:
 * only an `available` asset can be assigned, and a return states where the
 * asset goes next (back to stock, repair, retired, lost).
 */
@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customFields: CustomFieldValidatorService,
  ) {}

  async list(orgId: string, q: { status?: string; category?: string; employeeId?: string; search?: string }) {
    const rows = await this.prisma.asset.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...(q.status ? { status: q.status as AssetStatus } : {}),
        ...(q.category ? { category: q.category } : {}),
        ...(q.employeeId ? { assignedToId: q.employeeId } : {}),
        ...(q.search
          ? {
              OR: [
                { name: { contains: q.search, mode: 'insensitive' } },
                { assetTag: { contains: q.search, mode: 'insensitive' } },
                { serialNumber: { contains: q.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: this.include(),
      orderBy: [{ status: 'asc' }, { assetTag: 'asc' }],
    });
    return rows.map((a) => this.serialize(a));
  }

  /** The signed-in employee's currently held assets — scope-guarded self-service
   *  (no assets:read needed), mirroring how own payslips work. */
  async mine(orgId: string, userId: string) {
    const emp = await this.prisma.employee.findFirst({ where: { organizationId: orgId, userId, deletedAt: null }, select: { id: true } });
    if (!emp) return [];
    const rows = await this.prisma.asset.findMany({
      where: { organizationId: orgId, assignedToId: emp.id, deletedAt: null },
      include: this.include(),
      orderBy: { assetTag: 'asc' },
    });
    return rows.map((a) => this.serialize(a));
  }

  async create(orgId: string, userId: string, dto: CreateAssetDto) {
    const customFields = await this.customFields.validate(orgId, 'asset', dto.customFields, { skipRequired: false });
    const assetTag = dto.assetTag ?? (await this.nextTag(orgId));
    const dupe = await this.prisma.asset.findFirst({ where: { organizationId: orgId, assetTag, deletedAt: null }, select: { id: true } });
    if (dupe) throw new ConflictException(`Asset tag "${assetTag}" is already in use`);
    const created = await this.prisma.asset.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        assetTag,
        name: dto.name,
        category: dto.category,
        serialNumber: dto.serialNumber,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        purchaseCost: dto.purchaseCost,
        vendor: dto.vendor,
        warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil) : undefined,
        status: dto.status,
        condition: dto.condition,
        notes: dto.notes,
        customFields: (customFields ?? {}) as Prisma.InputJsonValue,
      },
      include: this.include(),
    });
    return this.serialize(created);
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateAssetDto) {
    const existing = await this.ensure(orgId, id);
    // Status is lifecycle-managed via assign/return — direct edits are allowed
    // only between the non-assigned states (you can't "edit away" a holder).
    if (dto.status && existing.status === 'assigned' && dto.status !== 'assigned') {
      throw new BadRequestException('This asset is assigned — return it first, then change its status.');
    }
    let customFields: Prisma.InputJsonValue | undefined;
    if (dto.customFields !== undefined) {
      customFields = (await this.customFields.validate(orgId, 'asset', {
        ...(existing.customFields as Record<string, unknown>),
        ...dto.customFields,
      })) as Prisma.InputJsonValue;
    }
    if (dto.assetTag && dto.assetTag !== existing.assetTag) {
      const dupe = await this.prisma.asset.findFirst({ where: { organizationId: orgId, assetTag: dto.assetTag, deletedAt: null, id: { not: id } }, select: { id: true } });
      if (dupe) throw new ConflictException(`Asset tag "${dto.assetTag}" is already in use`);
    }
    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        updatedById: userId,
        assetTag: dto.assetTag,
        name: dto.name,
        category: dto.category,
        serialNumber: dto.serialNumber,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        purchaseCost: dto.purchaseCost,
        vendor: dto.vendor,
        warrantyUntil: dto.warrantyUntil ? new Date(dto.warrantyUntil) : undefined,
        status: dto.status,
        condition: dto.condition,
        notes: dto.notes,
        ...(customFields !== undefined ? { customFields } : {}),
      },
      include: this.include(),
    });
    return this.serialize(updated);
  }

  async remove(orgId: string, userId: string, id: string) {
    const asset = await this.ensure(orgId, id);
    if (asset.status === 'assigned') throw new BadRequestException('This asset is assigned — return it before deleting.');
    await this.prisma.asset.update({ where: { id }, data: { deletedAt: new Date(), updatedById: userId } });
    return { success: true };
  }

  /** Issue an available asset to an employee: opens an assignment record and
   *  flips the pointer, atomically. */
  async assign(orgId: string, userId: string, id: string, dto: AssignAssetDto) {
    const asset = await this.ensure(orgId, id);
    if (asset.status !== 'available') {
      throw new BadRequestException(`Only available assets can be assigned — this one is ${asset.status.replace('_', ' ')}.`);
    }
    const emp = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, organizationId: orgId, deletedAt: null },
      select: { id: true },
    });
    if (!emp) throw new NotFoundException('Employee not found');

    const [, updated] = await this.prisma.$transaction([
      this.prisma.assetAssignment.create({
        data: {
          organizationId: orgId,
          assetId: id,
          employeeId: dto.employeeId,
          assignedById: userId,
          conditionOut: dto.condition ?? asset.condition,
          notes: dto.notes,
        },
      }),
      this.prisma.asset.update({
        where: { id },
        data: { status: 'assigned', assignedToId: dto.employeeId, condition: dto.condition ?? asset.condition, updatedById: userId },
        include: this.include(),
      }),
    ]);
    return this.serialize(updated);
  }

  /** Take an asset back: closes the open assignment (condition at return) and
   *  routes the asset to its next state — stock by default. */
  async return(orgId: string, userId: string, id: string, dto: ReturnAssetDto) {
    const asset = await this.ensure(orgId, id);
    if (asset.status !== 'assigned') throw new BadRequestException('This asset is not currently assigned.');
    const open = await this.prisma.assetAssignment.findFirst({
      where: { assetId: id, returnedAt: null },
      orderBy: { assignedAt: 'desc' },
    });

    const nextStatus = (dto.nextStatus ?? 'available') as AssetStatus;
    const [, updated] = await this.prisma.$transaction([
      open
        ? this.prisma.assetAssignment.update({
            where: { id: open.id },
            data: { returnedAt: new Date(), returnedById: userId, conditionIn: dto.condition, notes: dto.notes ?? open.notes },
          })
        : // Pointer said assigned but no open record (legacy/imported data) — the
          // return still proceeds so the asset isn't stuck.
          this.prisma.asset.findUnique({ where: { id } }),
      this.prisma.asset.update({
        where: { id },
        data: { status: nextStatus, assignedToId: null, condition: dto.condition ?? asset.condition, updatedById: userId },
        include: this.include(),
      }),
    ]);
    return this.serialize(updated as any);
  }

  /** Full issue/return trail for one asset, newest first. */
  async history(orgId: string, id: string) {
    await this.ensure(orgId, id);
    const rows = await this.prisma.assetAssignment.findMany({
      where: { assetId: id },
      orderBy: { assignedAt: 'desc' },
      include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employeeCode: r.employee.employeeCode,
      assignedAt: r.assignedAt,
      returnedAt: r.returnedAt,
      conditionOut: r.conditionOut,
      conditionIn: r.conditionIn,
      notes: r.notes,
    }));
  }

  // --- helpers ---

  private async ensure(orgId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  /** AST-0001-style sequential tag, per organization. */
  private async nextTag(orgId: string): Promise<string> {
    const count = await this.prisma.asset.count({ where: { organizationId: orgId } });
    return `AST-${String(count + 1).padStart(4, '0')}`;
  }

  private include() {
    return { assignedTo: { select: { id: true, firstName: true, lastName: true, employeeCode: true } } } as const;
  }

  private serialize(a: any) {
    return {
      id: a.id,
      assetTag: a.assetTag,
      name: a.name,
      category: a.category,
      serialNumber: a.serialNumber ?? null,
      purchaseDate: a.purchaseDate ?? null,
      purchaseCost: a.purchaseCost != null ? Number(a.purchaseCost) : null,
      vendor: a.vendor ?? null,
      warrantyUntil: a.warrantyUntil ?? null,
      status: a.status,
      condition: a.condition ?? null,
      notes: a.notes ?? null,
      customFields: a.customFields ?? {},
      assignedToId: a.assignedToId ?? null,
      assignedToName: a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : null,
      assignedToCode: a.assignedTo?.employeeCode ?? null,
      createdAt: a.createdAt,
    };
  }
}
