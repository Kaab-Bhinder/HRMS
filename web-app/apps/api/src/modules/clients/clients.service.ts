import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

/**
 * Clients are companies the organization serves — records only, never users:
 * they have no login, no platform access, and nothing is shared outward.
 * Each client links to the department (team) that serves it, and everything
 * shown "for a client" — roster, attendance, tasks, reports — is computed live
 * from that department's existing data. The client row itself stores only
 * identity and contact details, so there is no second copy of anything to
 * drift out of date.
 */
@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(orgId: string) {
    const rows = await this.prisma.client.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      include: {
        department: {
          select: {
            id: true,
            name: true,
            head: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { members: { where: { deletedAt: null } } } },
          },
        },
      },
    });
    return rows.map((c) => this.serialize(c));
  }

  async create(orgId: string, userId: string, dto: CreateClientDto) {
    await this.assertDepartment(orgId, dto.departmentId);
    const created = await this.prisma.client.create({
      data: { organizationId: orgId, createdById: userId, ...dto },
      include: this.include(),
    });
    return this.serialize(created);
  }

  async update(orgId: string, userId: string, id: string, dto: UpdateClientDto) {
    await this.ensure(orgId, id);
    await this.assertDepartment(orgId, dto.departmentId);
    const updated = await this.prisma.client.update({
      where: { id },
      data: { updatedById: userId, ...dto },
      include: this.include(),
    });
    return this.serialize(updated);
  }

  async remove(orgId: string, userId: string, id: string) {
    await this.ensure(orgId, id);
    await this.prisma.client.update({ where: { id }, data: { deletedAt: new Date(), updatedById: userId } });
    return { success: true };
  }

  /**
   * How the serving team is performing for this client, computed live from the
   * linked department: roster, this month's attendance mix, task pipeline and
   * the latest reports filed by that department.
   */
  async performance(orgId: string, id: string) {
    const client = await this.ensure(orgId, id);
    if (!client.departmentId) {
      return { client: this.serialize(client), team: null };
    }
    const deptId = client.departmentId;
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const [dept, members] = await Promise.all([
      this.prisma.department.findFirst({
        where: { id: deptId, organizationId: orgId },
        select: { id: true, name: true, head: { select: { id: true, firstName: true, lastName: true } } },
      }),
      this.prisma.employee.findMany({
        where: { organizationId: orgId, departmentId: deptId, deletedAt: null },
        select: {
          id: true, firstName: true, lastName: true, employeeCode: true, status: true,
          designation: { select: { title: true } },
        },
        orderBy: { firstName: 'asc' },
      }),
    ]);
    const memberIds = members.map((m) => m.id);

    const [days, taskGroups, overdueTasks, reports] = await Promise.all([
      memberIds.length
        ? this.prisma.attendanceDay.groupBy({
            by: ['status'],
            where: { organizationId: orgId, employeeId: { in: memberIds }, workDate: { gte: monthStart, lte: today } },
            _count: { status: true },
          })
        : Promise.resolve([] as { status: string; _count: { status: number } }[]),
      this.prisma.task.groupBy({
        by: ['status'],
        where: { organizationId: orgId, departmentId: deptId, deletedAt: null },
        _count: { status: true },
      }),
      this.prisma.task.count({
        where: {
          organizationId: orgId, departmentId: deptId, deletedAt: null,
          dueDate: { lt: today }, status: { notIn: ['done', 'cancelled'] },
        },
      }),
      this.prisma.report.findMany({
        where: { organizationId: orgId, departmentId: deptId },
        orderBy: { submittedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, periodLabel: true, status: true, submittedAt: true, submitterName: true },
      }),
    ]);

    const att: Record<string, number> = {};
    for (const d of days) att[d.status] = d._count.status;
    const presentDays = (att['present'] ?? 0) + (att['late'] ?? 0) + (att['half_day'] ?? 0);
    const recorded = Object.values(att).reduce((s, n) => s + n, 0);

    const tasks: Record<string, number> = {};
    for (const t of taskGroups) tasks[t.status] = t._count.status;
    const openTasks = Object.entries(tasks)
      .filter(([s]) => !['done', 'cancelled'].includes(s))
      .reduce((s, [, n]) => s + n, 0);

    return {
      client: this.serialize(client),
      team: {
        departmentId: dept?.id ?? deptId,
        departmentName: dept?.name ?? null,
        headName: dept?.head ? `${dept.head.firstName} ${dept.head.lastName}` : null,
        memberCount: members.length,
        members: members.map((m) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`,
          employeeCode: m.employeeCode,
          designation: m.designation?.title ?? null,
          status: m.status,
        })),
        attendance: {
          presentDays,
          lateDays: att['late'] ?? 0,
          absentDays: att['absent'] ?? 0,
          onLeaveDays: att['on_leave'] ?? 0,
          recordedDays: recorded,
          presentRate: recorded > 0 ? Math.round((presentDays / recorded) * 100) : null,
        },
        tasks: {
          open: openTasks,
          inProgress: tasks['in_progress'] ?? 0,
          blocked: tasks['blocked'] ?? 0,
          done: tasks['done'] ?? 0,
          overdue: overdueTasks,
        },
        recentReports: reports,
      },
    };
  }

  // --- helpers ---

  private async ensure(orgId: string, id: string) {
    const client = await this.prisma.client.findFirst({ where: { id, organizationId: orgId, deletedAt: null }, include: this.include() });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  /** A client's serving team must be a real department in this org. */
  private async assertDepartment(orgId: string, departmentId?: string) {
    if (!departmentId) return;
    const dept = await this.prisma.department.findFirst({ where: { id: departmentId, organizationId: orgId, deletedAt: null }, select: { id: true } });
    if (!dept) throw new BadRequestException('The selected department does not exist');
  }

  private include() {
    return {
      department: {
        select: {
          id: true,
          name: true,
          head: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { members: { where: { deletedAt: null } } } },
        },
      },
    } as const;
  }

  private serialize(c: any) {
    return {
      id: c.id,
      name: c.name,
      code: c.code ?? null,
      contactPerson: c.contactPerson ?? null,
      contactEmail: c.contactEmail ?? null,
      contactPhone: c.contactPhone ?? null,
      status: c.status,
      notes: c.notes ?? null,
      departmentId: c.departmentId ?? null,
      departmentName: c.department?.name ?? null,
      headName: c.department?.head ? `${c.department.head.firstName} ${c.department.head.lastName}` : null,
      teamSize: c.department?._count?.members ?? 0,
      createdAt: c.createdAt,
    };
  }
}
