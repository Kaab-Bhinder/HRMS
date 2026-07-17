import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/** Read-only catalog of assignable permissions (backs the role editor grid). */
@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
    return rows.map((p) => ({
      id: p.id,
      key: p.key,
      resource: p.resource,
      action: p.action,
      description: p.description ?? '',
    }));
  }
}
