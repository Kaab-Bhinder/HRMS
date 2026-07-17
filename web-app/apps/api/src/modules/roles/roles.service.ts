import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

/** Serialized role shape the admin UI consumes (permissions as flat key array). */
function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string) {
    const rows = await this.prisma.role.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      include: {
        permissions: { select: { permission: { select: { key: true } } } },
        _count: { select: { users: true } },
      },
    });
    return rows.map((r) => this.serialize(r));
  }

  async get(orgId: string, id: string) {
    const r = await this.prisma.role.findFirst({
      where: { id, organizationId: orgId, deletedAt: null },
      include: {
        permissions: { select: { permission: { select: { key: true } } } },
        _count: { select: { users: true } },
      },
    });
    if (!r) throw new NotFoundException('Role not found');
    return this.serialize(r);
  }

  async create(orgId: string, dto: CreateRoleDto) {
    const slug = slugify(dto.name);
    if (!slug) throw new BadRequestException('Role name must contain letters or numbers');
    await this.assertSlugFree(orgId, slug);

    const permissionIds = await this.resolvePermissionIds(dto.permissions ?? []);
    const role = await this.prisma.role.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        slug,
        description: dto.description,
        isSystem: false,
        canAccessWeb: dto.canAccessWeb ?? false,
        canAccessMobile: dto.canAccessMobile ?? false,
        permissions: { create: permissionIds.map((permissionId) => ({ permissionId })) },
      },
    });
    return this.get(orgId, role.id);
  }

  async update(orgId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.ensure(orgId, id);

    // System roles keep their identity; only their permission set may be tuned,
    // and the Super Admin role is fully locked (it must always hold everything).
    if (role.isSystem && role.slug === 'super-admin') {
      throw new BadRequestException('The Super Admin role cannot be modified');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined && !role.isSystem) {
      const slug = slugify(dto.name);
      if (!slug) throw new BadRequestException('Role name must contain letters or numbers');
      if (slug !== role.slug) await this.assertSlugFree(orgId, slug);
      data.name = dto.name;
      data.slug = slug;
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.canAccessWeb !== undefined) data.canAccessWeb = dto.canAccessWeb;
    if (dto.canAccessMobile !== undefined) data.canAccessMobile = dto.canAccessMobile;

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) await tx.role.update({ where: { id }, data });
      if (dto.permissions !== undefined) {
        const permissionIds = await this.resolvePermissionIds(dto.permissions);
        await tx.rolePermission.deleteMany({ where: { roleId: id } });
        if (permissionIds.length) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.get(orgId, id);
  }

  async remove(orgId: string, id: string) {
    const role = await this.ensure(orgId, id);
    if (role.isSystem) throw new BadRequestException('System roles cannot be deleted');

    const assigned = await this.prisma.userRole.count({ where: { roleId: id } });
    if (assigned) throw new ConflictException('Reassign the users on this role before deleting it');

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      this.prisma.role.update({ where: { id }, data: { deletedAt: new Date() } }),
    ]);
    return { success: true };
  }

  // --- helpers ---

  private async ensure(orgId: string, id: string) {
    const role = await this.prisma.role.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  private async assertSlugFree(orgId: string, slug: string) {
    const existing = await this.prisma.role.findFirst({ where: { organizationId: orgId, slug, deletedAt: null } });
    if (existing) throw new ConflictException('A role with this name already exists');
  }

  /** Maps permission keys → ids, rejecting any unknown key. */
  private async resolvePermissionIds(keys: string[]): Promise<string[]> {
    if (!keys.length) return [];
    const perms = await this.prisma.permission.findMany({ where: { key: { in: keys } }, select: { id: true, key: true } });
    if (perms.length !== new Set(keys).size) {
      const found = new Set(perms.map((p) => p.key));
      const unknown = keys.filter((k) => !found.has(k));
      throw new BadRequestException(`Unknown permission(s): ${unknown.join(', ')}`);
    }
    return perms.map((p) => p.id);
  }

  private serialize(r: any) {
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? '',
      isSystem: r.isSystem,
      canAccessWeb: r.canAccessWeb,
      canAccessMobile: r.canAccessMobile,
      userCount: r._count?.users ?? 0,
      permissions: (r.permissions ?? []).map((rp: any) => rp.permission.key),
    };
  }
}
