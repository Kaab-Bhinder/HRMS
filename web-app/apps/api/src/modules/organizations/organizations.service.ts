import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto, UpdateLocationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { isValidTimeZone } from '../../common/tz';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

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
      data: { ...dto, settings: dto.settings as Prisma.InputJsonValue | undefined },
    });
  }

  private assertLocationTimezone(dto: { timezone?: string }) {
    if (dto.timezone && !isValidTimeZone(dto.timezone)) {
      throw new BadRequestException(`"${dto.timezone}" is not a valid IANA timezone`);
    }
  }

  listLocations(orgId: string) {
    return this.prisma.location.findMany({ where: { organizationId: orgId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  createLocation(orgId: string, dto: CreateLocationDto) {
    this.assertLocationTimezone(dto);
    return this.prisma.location.create({ data: { organizationId: orgId, ...dto } });
  }

  async updateLocation(orgId: string, id: string, dto: UpdateLocationDto) {
    this.assertLocationTimezone(dto);
    await this.ensureLocation(orgId, id);
    return this.prisma.location.update({ where: { id }, data: dto });
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
}
