import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertDesignationDto } from './dto/designation.dto';

@Injectable()
export class DesignationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string) {
    const rows = await this.prisma.designation.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: [{ level: 'desc' }, { title: 'asc' }],
      include: { _count: { select: { employees: true } } },
    });
    return rows.map((d) => ({ id: d.id, title: d.title, level: d.level, description: d.description, employeeCount: d._count.employees }));
  }

  async create(orgId: string, dto: UpsertDesignationDto) {
    return this.prisma.designation.create({ data: { organizationId: orgId, title: dto.title, level: dto.level, description: dto.description } });
  }

  async update(orgId: string, id: string, dto: UpsertDesignationDto) {
    await this.ensure(orgId, id);
    return this.prisma.designation.update({ where: { id }, data: { title: dto.title, level: dto.level, description: dto.description } });
  }

  async remove(orgId: string, id: string) {
    await this.ensure(orgId, id);
    await this.prisma.designation.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  private async ensure(orgId: string, id: string) {
    const found = await this.prisma.designation.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!found) throw new NotFoundException('Designation not found');
    return found;
  }
}
