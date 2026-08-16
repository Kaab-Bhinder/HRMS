import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto, UpdateLocationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { isValidTimeZone } from '../../common/tz';
import { ClientsService } from '../clients/clients.service';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clients: ClientsService,
  ) {}

  async current(orgId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  update(orgId: string, dto: UpdateOrganizationDto) {
    // Organization.timezone is the single source of truth for the attendance
    // engine (recompute, auto-checkout, slips all read it). An unrecognised
    // zone makes every one of them silently fall back to UTC, so late arrivals
    // and auto-checkout would be computed against the wrong clock with no
    // error anywhere. Attendance Settings already validates this; the two
    // write the same column, so this path has to as well.
    if (dto.timezone && !isValidTimeZone(dto.timezone)) {
      throw new BadRequestException(`"${dto.timezone}" is not a valid IANA timezone`);
    }
    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ...dto,
        // Stored bare so it can be concatenated directly. People paste
        // '@pwigroup.id' or 'https://pwigroup.id/' just as often as the
        // domain alone, and all three mean the same thing.
        ...(dto.emailDomain !== undefined
          ? { emailDomain: normalizeDomain(dto.emailDomain) }
          : {}),
        settings: dto.settings as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private assertLocationTimezone(dto: { timezone?: string }) {
    if (dto.timezone && !isValidTimeZone(dto.timezone)) {
      throw new BadRequestException(`"${dto.timezone}" is not a valid IANA timezone`);
    }
  }

  async listLocations(orgId: string) {
    const rows = await this.prisma.location.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { name: 'asc' },
      include: { client: { select: { id: true, name: true } } },
    });
    return rows.map((l) => ({ ...l, clientName: l.client?.name ?? null, client: undefined }));
  }

  async createLocation(orgId: string, dto: CreateLocationDto) {
    this.assertLocationTimezone(dto);
    await this.assertClient(orgId, dto.clientId);
    const created = await this.prisma.location.create({ data: { organizationId: orgId, ...dto } });
    // A client site registered after the client↔department link still moves
    // the serving team here — the sync works whichever half lands first.
    if (created.clientId) await this.clients.syncTeamToClientSite(orgId, created.clientId);
    return created;
  }

  async updateLocation(orgId: string, id: string, dto: UpdateLocationDto) {
    this.assertLocationTimezone(dto);
    await this.assertClient(orgId, dto.clientId);
    await this.ensureLocation(orgId, id);
    const updated = await this.prisma.location.update({ where: { id }, data: dto });
    if (updated.clientId) await this.clients.syncTeamToClientSite(orgId, updated.clientId);
    return updated;
  }

  async removeLocation(orgId: string, id: string) {
    await this.ensureLocation(orgId, id);
    await this.prisma.location.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private async ensureLocation(orgId: string, id: string) {
    const loc = await this.prisma.location.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!loc) throw new NotFoundException('Location not found');
    return loc;
  }

  /** A site tagged to a client must reference a client in THIS org. */
  private async assertClient(orgId: string, clientId?: string | null) {
    if (!clientId) return;
    const client = await this.prisma.client.findFirst({ where: { id: clientId, organizationId: orgId, deletedAt: null }, select: { id: true } });
    if (!client) throw new BadRequestException('The selected client does not exist');
  }
}

/** Reduces whatever was typed to a bare domain, or null when cleared. */
function normalizeDomain(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
  return cleaned || null;
}
