import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Single aggregate payload consumed by the admin dashboard. Never loads full rows. */
  async overview(orgId: string, q: AnalyticsQueryDto) {
    const empWhere = this.employeeWhere(orgId, q);
    const today = this.startOfDay(q.to ? new Date(q.to) : new Date());

    const [
      headcount,
      total,
      presentToday,
      onLeaveByStatus,
      onLeaveToday,
      openTasks,
      attrition,
      pendingApprovals,
    ] = await Promise.all([
      this.prisma.employee.count({ where: { ...empWhere, status: 'active' } }),
      this.prisma.employee.count({ where: empWhere }),
      this.prisma.attendanceDay.count({ where: { ...this.attendanceWhere(orgId, q), workDate: today, status: 'present' } }),
      this.prisma.employee.count({ where: { ...empWhere, status: 'on_leave' } }),
      this.prisma.attendanceDay.count({ where: { ...this.attendanceWhere(orgId, q), workDate: today, status: 'on_leave' } }),
      this.prisma.task.count({ where: this.taskWhere(orgId, q, { status: { notIn: ['done', 'cancelled'] } }) }),
      this.prisma.employee.count({ where: { ...empWhere, status: { in: ['resigned', 'terminated'] } } }),
      this.prisma.leaveRequest.count({ where: { organizationId: orgId, deletedAt: null, status: 'pending' } }),
    ]);

    const attritionRate = total > 0 ? Math.round((attrition / total) * 1000) / 10 : 0;

    const [attendanceTrend, departmentHeadcount, taskStatus, productivity, genderSplit] = await Promise.all([
      this.attendanceTrend(orgId, q),
      this.departmentHeadcount(orgId, q),
      this.taskStatus(orgId, q),
      this.productivity(orgId, q),
      this.genderSplit(orgId, q),
    ]);

    return {
      headcount: { value: headcount, delta: 0 },
      presentToday: { value: presentToday, total: headcount },
      onLeave: { value: onLeaveByStatus + onLeaveToday, delta: 0 },
      openTasks: { value: openTasks, delta: 0 },
      attritionRate: { value: attritionRate, delta: 0 },
      pendingApprovals,
      attendanceTrend,
      departmentHeadcount,
      taskStatus,
      productivity,
      genderSplit,
    };
  }

  /** Attendance status breakdown over a date range (defaults to last 30 days). */
  async attendance(orgId: string, q: AnalyticsQueryDto) {
    const to = this.startOfDay(q.to ? new Date(q.to) : new Date());
    const from = this.startOfDay(q.from ? new Date(q.from) : this.addDays(to, -29));
    const rows = await this.prisma.attendanceDay.groupBy({
      by: ['status'],
      where: { ...this.attendanceWhere(orgId, q), workDate: { gte: from, lte: to } },
      _count: { _all: true },
    });
    let total = 0;
    const breakdown = rows.map((r) => {
      total += r._count._all;
      return { status: r.status, count: r._count._all };
    });
    return { from: this.iso(from), to: this.iso(to), total, breakdown };
  }

  /** Per-department headcount + today's present percentage. */
  async departments(orgId: string, q: AnalyticsQueryDto) {
    const today = this.startOfDay(q.to ? new Date(q.to) : new Date());
    const depts = await this.prisma.department.findMany({
      where: { organizationId: orgId, deletedAt: null, ...(q.departmentId ? { id: q.departmentId } : {}) },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
    if (depts.length === 0) return [];

    const headcounts = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      where: { ...this.employeeWhere(orgId, q), status: 'active' },
      _count: { _all: true },
    });
    const headMap = new Map(headcounts.map((h) => [h.departmentId, h._count._all]));

    const present = await Promise.all(
      depts.map((d) =>
        this.prisma.attendanceDay.count({
          where: { organizationId: orgId, workDate: today, status: 'present', employee: { departmentId: d.id, deletedAt: null } },
        }),
      ),
    );

    return depts.map((d, i) => {
      const headcount = headMap.get(d.id) ?? 0;
      const presentToday = present[i];
      return {
        departmentId: d.id,
        department: d.code ?? d.name,
        headcount,
        presentToday,
        presentPercent: headcount > 0 ? Math.round((presentToday / headcount) * 1000) / 10 : 0,
      };
    });
  }

  // --- chart builders ---

  /** Last 14 days present/absent/late counts. */
  private async attendanceTrend(orgId: string, q: AnalyticsQueryDto) {
    const end = this.startOfDay(q.to ? new Date(q.to) : new Date());
    const start = this.addDays(end, -13);
    const rows = await this.prisma.attendanceDay.groupBy({
      by: ['workDate', 'status'],
      where: { ...this.attendanceWhere(orgId, q), workDate: { gte: start, lte: end } },
      _count: { _all: true },
    });

    const byDate = new Map<string, { present: number; absent: number; late: number }>();
    for (let i = 0; i < 14; i++) {
      byDate.set(this.mmdd(this.addDays(start, i)), { present: 0, absent: 0, late: 0 });
    }
    for (const r of rows) {
      const key = this.mmdd(r.workDate);
      const bucket = byDate.get(key);
      if (!bucket) continue;
      if (r.status === 'present') bucket.present += r._count._all;
      else if (r.status === 'absent') bucket.absent += r._count._all;
      else if (r.status === 'late') bucket.late += r._count._all;
    }
    return [...byDate.entries()].map(([date, v]) => ({ date, ...v }));
  }

  private async departmentHeadcount(orgId: string, q: AnalyticsQueryDto) {
    const grouped = await this.prisma.employee.groupBy({
      by: ['departmentId'],
      where: { ...this.employeeWhere(orgId, q), status: 'active', departmentId: { not: null } },
      _count: { _all: true },
    });
    if (grouped.length === 0) return [];
    const ids = grouped.map((g) => g.departmentId).filter((id): id is string => !!id);
    const depts = await this.prisma.department.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, code: true } });
    const nameMap = new Map(depts.map((d) => [d.id, d.code ?? d.name]));
    return grouped.map((g) => ({ department: nameMap.get(g.departmentId!) ?? 'Unknown', count: g._count._all }));
  }

  private async taskStatus(orgId: string, q: AnalyticsQueryDto) {
    const grouped = await this.prisma.task.groupBy({
      by: ['status'],
      where: this.taskWhere(orgId, q),
      _count: { _all: true },
    });
    return grouped.map((g) => ({ status: g.status, count: g._count._all }));
  }

  /** Last 8 weeks: assigned = tasks created that week, completed = tasks completed that week. */
  private async productivity(orgId: string, q: AnalyticsQueryDto) {
    const end = this.startOfDay(q.to ? new Date(q.to) : new Date());
    const weeks: { start: Date; end: Date }[] = [];
    for (let i = 7; i >= 0; i--) {
      const start = this.addDays(end, -7 * (i + 1) + 1);
      const wEnd = this.addDays(end, -7 * i);
      weeks.push({ start, end: this.endOfDay(wEnd) });
    }
    const results = await Promise.all(
      weeks.flatMap((w) => [
        this.prisma.task.count({ where: this.taskWhere(orgId, q, { createdAt: { gte: w.start, lte: w.end } }) }),
        this.prisma.task.count({ where: this.taskWhere(orgId, q, { status: 'done', completedAt: { gte: w.start, lte: w.end } }) }),
      ]),
    );
    return weeks.map((_, i) => ({ week: `W${i + 1}`, assigned: results[i * 2], completed: results[i * 2 + 1] }));
  }

  private async genderSplit(orgId: string, q: AnalyticsQueryDto) {
    const grouped = await this.prisma.employee.groupBy({
      by: ['gender'],
      where: { ...this.employeeWhere(orgId, q), status: 'active' },
      _count: { _all: true },
    });
    const map = new Map(grouped.map((g) => [g.gender, g._count._all]));
    return [
      { label: 'Male', value: map.get('male') ?? 0 },
      { label: 'Female', value: map.get('female') ?? 0 },
    ];
  }

  // --- where builders ---

  private employeeWhere(orgId: string, q: AnalyticsQueryDto): Prisma.EmployeeWhereInput {
    return {
      organizationId: orgId,
      deletedAt: null,
      ...(q.departmentId ? { departmentId: q.departmentId } : {}),
      ...(q.locationId ? { locationId: q.locationId } : {}),
      ...(q.employeeId ? { id: q.employeeId } : {}),
    };
  }

  private attendanceWhere(orgId: string, q: AnalyticsQueryDto): Prisma.AttendanceDayWhereInput {
    const emp: Prisma.EmployeeWhereInput = { deletedAt: null };
    if (q.departmentId) emp.departmentId = q.departmentId;
    if (q.locationId) emp.locationId = q.locationId;
    return {
      organizationId: orgId,
      ...(q.employeeId ? { employeeId: q.employeeId } : {}),
      ...(q.departmentId || q.locationId ? { employee: emp } : {}),
    };
  }

  private taskWhere(orgId: string, q: AnalyticsQueryDto, extra: Prisma.TaskWhereInput = {}): Prisma.TaskWhereInput {
    return {
      organizationId: orgId,
      deletedAt: null,
      ...(q.departmentId ? { departmentId: q.departmentId } : {}),
      ...extra,
    };
  }

  // --- date helpers (UTC) ---

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  }

  private endOfDay(d: Date): Date {
    const x = new Date(d);
    x.setUTCHours(23, 59, 59, 999);
    return x;
  }

  private addDays(d: Date, days: number): Date {
    const x = new Date(d);
    x.setUTCDate(x.getUTCDate() + days);
    return x;
  }

  private mmdd(d: Date): string {
    const x = new Date(d);
    return `${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`;
  }

  private iso(d: Date): string {
    return this.startOfDay(d).toISOString().slice(0, 10);
  }
}
