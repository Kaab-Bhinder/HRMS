import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { paginated } from '../../common/dto/pagination.dto';

export interface AuditEntry {
  organizationId?: string;
  actorUserId?: string;
  actorName?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget audit write (never blocks or breaks the request). */
  log(entry: AuditEntry): void {
    this.prisma.auditLog
      .create({
        data: {
          organizationId: entry.organizationId,
          actorUserId: entry.actorUserId,
          actorName: entry.actorName,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          beforeData: entry.beforeData as Prisma.InputJsonValue,
          afterData: entry.afterData as Prisma.InputJsonValue,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          requestId: entry.requestId,
        },
      })
      .catch(() => undefined);
  }

  /** Searchable / filterable audit query. */
  async list(orgId: string, q: { page?: number; limit?: number; search?: string; action?: string; entityType?: string; actorUserId?: string; from?: string; to?: string }) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const where: Prisma.AuditLogWhereInput = {
      organizationId: orgId,
      ...(q.action ? { action: q.action as AuditAction } : {}),
      ...(q.entityType ? { entityType: q.entityType } : {}),
      ...(q.actorUserId ? { actorUserId: q.actorUserId } : {}),
      ...(q.from || q.to ? { createdAt: { ...(q.from ? { gte: new Date(q.from) } : {}), ...(q.to ? { lte: new Date(q.to) } : {}) } } : {}),
      ...(q.search
        ? { OR: [{ actorName: { contains: q.search, mode: 'insensitive' } }, { entityType: { contains: q.search, mode: 'insensitive' } }, { entityId: { contains: q.search, mode: 'insensitive' } }, { ipAddress: { contains: q.search, mode: 'insensitive' } }] }
        : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.auditLog.count({ where }),
    ]);
    return paginated(
      rows.map((r) => ({
        id: r.id, actorName: r.actorName ?? 'System', action: r.action,
        entityType: r.entityType, entityLabel: r.entityId ?? '—',
        ipAddress: r.ipAddress ?? '—', requestId: r.requestId,
        before: r.beforeData, after: r.afterData, createdAt: r.createdAt,
      })),
      total, page, limit,
    );
  }

  activity(orgId: string, limit = 15) {
    return this.prisma.activityLog.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' }, take: limit });
  }
}
