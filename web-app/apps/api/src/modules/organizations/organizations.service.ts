import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateLocationDto, UpdateLocationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(orgId: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  update(orgId: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: { ...dto, settings: dto.settings as Prisma.InputJsonValue | undefined },
    });
  }

  listLocations(orgId: string) {
    return this.prisma.location.findMany({ where: { organizationId: orgId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  createLocation(orgId: string, dto: CreateLocationDto) {
    return this.prisma.location.create({ data: { organizationId: orgId, ...dto } });
  }

  async updateLocation(orgId: string, id: string, dto: UpdateLocationDto) {
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
