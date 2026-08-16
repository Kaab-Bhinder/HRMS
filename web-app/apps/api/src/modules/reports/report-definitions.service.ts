import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

export interface ReportColumn { key: string; label: string }
export interface Dataset { columns: ReportColumn[]; rows: Record<string, unknown>[] }

/** Parameters a specific report accepts, so the UI can ask for the right ones. */
export type ParamKind = 'date' | 'month' | 'range' | 'department' | 'status';

export interface ReportDefinition {
  key: string;
  title: string;
  description: string;
  module: 'Attendance' | 'Payroll' | 'Leave' | 'Employees' | 'Performance' | 'Assets';
  params: ParamKind[];
  build(ctx: BuildCtx): Promise<Dataset>;
}

export interface BuildCtx {
  orgId: string;
  prisma: PrismaService;
  /** ISO date for single-day reports. */
  date?: string;
  /** Inclusive range for period reports. */
  from?: string;
  to?: string;
  departmentId?: string;
  status?: string;
}

const CAP = 5000;
const iso = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : '');
const hhmm = (d: Date | null | undefined) =>
  d ? `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}` : '';
const mins = (n: number | null | undefined) => (n == null ? '' : (n / 60).toFixed(2));

/** Resolves a report's period, defaulting sensibly so a run never returns everything by accident. */
function period(ctx: BuildCtx): { gte: Date; lte: Date } {
  if (ctx.from || ctx.to) {
    const gte = ctx.from ? new Date(ctx.from) : new Date('1970-01-01');
    const lte = ctx.to ? new Date(ctx.to) : new Date();
    return { gte, lte };
  }
  // Default: the current calendar month.
  const now = new Date();
  return {
    gte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    lte: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)),
  };
}

const empFilter = (ctx: BuildCtx): Prisma.EmployeeWhereInput => ({
  organizationId: ctx.orgId,
  deletedAt: null,
  ...(ctx.departmentId ? { departmentId: ctx.departmentId } : {}),
  ...(ctx.status ? { status: ctx.status as never } : {}),
});

/**
 * Every report the catalogue offers, each with its OWN query, columns, and
 * parameters. Previously each module exported one generic table, so the
 * thirteen catalogue entries produced only three distinct files — the titles
 * described reports that did not exist.
 */
export const REPORT_DEFINITIONS: ReportDefinition[] = [
  {
    key: 'att-daily',
    title: 'Daily Attendance Register',
    description: 'Check-in/out times, late marks and flagged records for one day.',
    module: 'Attendance',
    params: ['date', 'department'],
    async build(ctx) {
      const day = new Date(ctx.date ?? new Date().toISOString().slice(0, 10));
      const rows = await ctx.prisma.attendanceDay.findMany({
        where: {
          organizationId: ctx.orgId,
          workDate: day,
          ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}),
        },
        include: { employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } } },
        orderBy: [{ employee: { firstName: 'asc' } }],
        take: CAP,
      });
      // AttendanceDay stores locationId without a relation, so resolve names once.
      const siteNames = new Map(
        (await ctx.prisma.location.findMany({ where: { organizationId: ctx.orgId }, select: { id: true, name: true } }))
          .map((l) => [l.id, l.name]),
      );
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' },
          { key: 'department', label: 'Department' }, { key: 'site', label: 'Work Site' },
          { key: 'checkIn', label: 'Check In' }, { key: 'checkOut', label: 'Check Out' },
          { key: 'workedHours', label: 'Worked (h)' }, { key: 'lateMinutes', label: 'Late (min)' },
          { key: 'status', label: 'Status' }, { key: 'flagged', label: 'Flagged' }, { key: 'flagReason', label: 'Flag Reason' },
        ],
        rows: rows.map((r) => ({
          employeeCode: r.employee.employeeCode,
          name: `${r.employee.firstName} ${r.employee.lastName}`,
          department: r.employee.department?.name ?? '',
          site: r.locationId ? siteNames.get(r.locationId) ?? '' : '',
          checkIn: hhmm(r.firstInAt), checkOut: hhmm(r.lastOutAt),
          workedHours: mins(r.workedMinutes), lateMinutes: r.lateMinutes ?? 0,
          status: r.status, flagged: r.isFlagged ? 'Yes' : 'No', flagReason: r.flagReason ?? '',
        })),
      };
    },
  },
  {
    key: 'att-monthly',
    title: 'Monthly Attendance Summary',
    description: 'Per-employee present, absent, late and overtime totals across a period.',
    module: 'Attendance',
    params: ['range', 'department'],
    async build(ctx) {
      const { gte, lte } = period(ctx);
      const [emps, days] = await Promise.all([
        ctx.prisma.employee.findMany({
          where: empFilter(ctx),
          select: { id: true, employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } },
          take: CAP,
        }),
        ctx.prisma.attendanceDay.findMany({
          where: { organizationId: ctx.orgId, workDate: { gte, lte }, ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}) },
          select: { employeeId: true, status: true, workedMinutes: true, overtimeMinutes: true, lateMinutes: true, isFlagged: true },
        }),
      ]);
      const acc = new Map<string, Record<string, number>>();
      for (const d of days) {
        const a = acc.get(d.employeeId) ?? { present: 0, absent: 0, late: 0, leave: 0, flagged: 0, worked: 0, ot: 0 };
        if (d.status === 'present') a.present++;
        else if (d.status === 'absent') a.absent++;
        else if (d.status === 'late') { a.present++; a.late++; }
        else if (d.status === 'on_leave') a.leave++;
        if ((d.lateMinutes ?? 0) > 0 && d.status !== 'late') a.late++;
        if (d.isFlagged) a.flagged++;
        a.worked += d.workedMinutes ?? 0;
        a.ot += d.overtimeMinutes ?? 0;
        acc.set(d.employeeId, a);
      }
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' }, { key: 'department', label: 'Department' },
          { key: 'present', label: 'Present' }, { key: 'absent', label: 'Absent' }, { key: 'late', label: 'Late' },
          { key: 'leave', label: 'On Leave' }, { key: 'workedHours', label: 'Worked (h)' },
          { key: 'overtimeHours', label: 'Overtime (h)' }, { key: 'flagged', label: 'Flagged Days' },
        ],
        rows: emps.map((e) => {
          const a = acc.get(e.id) ?? { present: 0, absent: 0, late: 0, leave: 0, flagged: 0, worked: 0, ot: 0 };
          return {
            employeeCode: e.employeeCode, name: `${e.firstName} ${e.lastName}`, department: e.department?.name ?? '',
            present: a.present, absent: a.absent, late: a.late, leave: a.leave,
            workedHours: mins(a.worked), overtimeHours: mins(a.ot), flagged: a.flagged,
          };
        }),
      };
    },
  },
  {
    key: 'att-biometric',
    title: 'Biometric Exceptions',
    description: 'Face check-ins that failed to match or failed liveness, for review.',
    module: 'Attendance',
    params: ['range', 'department'],
    async build(ctx) {
      const { gte, lte } = period(ctx);
      const rows = await ctx.prisma.faceCapture.findMany({
        where: {
          organizationId: ctx.orgId,
          capturedAt: { gte, lte: new Date(lte.getTime() + 86_399_000) },
          OR: [{ matched: false }, { livenessPassed: false }],
        },
        orderBy: { capturedAt: 'desc' },
        take: CAP,
      });
      // FaceCapture stores employeeId without a relation — resolve separately.
      const emps = new Map(
        (await ctx.prisma.employee.findMany({
          where: { id: { in: [...new Set(rows.map((r) => r.employeeId))] } },
          select: { id: true, employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } },
        })).map((e) => [e.id, e]),
      );
      return {
        columns: [
          { key: 'capturedAt', label: 'When' }, { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' },
          { key: 'department', label: 'Department' }, { key: 'matched', label: 'Face Matched' },
          { key: 'confidence', label: 'Match %' }, { key: 'liveness', label: 'Liveness' }, { key: 'provider', label: 'Engine' },
        ],
        rows: rows.map((c) => ({
          capturedAt: c.capturedAt.toISOString().slice(0, 16).replace('T', ' '),
          employeeCode: emps.get(c.employeeId)?.employeeCode ?? '',
          name: (() => { const e = emps.get(c.employeeId); return e ? `${e.firstName} ${e.lastName}` : ''; })(),
          department: emps.get(c.employeeId)?.department?.name ?? '',
          matched: c.matched ? 'Yes' : 'No',
          confidence: c.confidenceScore != null ? Number(c.confidenceScore).toFixed(1) : '',
          liveness: c.livenessPassed ? 'Passed' : 'Failed', provider: c.provider ?? '',
        })),
      };
    },
  },
  {
    key: 'emp-directory',
    title: 'Employee Directory',
    description: 'Master roster with department, designation, site and contact details.',
    module: 'Employees',
    params: ['department', 'status'],
    async build(ctx) {
      const rows = await ctx.prisma.employee.findMany({
        where: empFilter(ctx),
        include: {
          department: { select: { name: true } }, designation: { select: { title: true } },
          location: { select: { name: true } }, manager: { select: { firstName: true, lastName: true } },
        },
        orderBy: { firstName: 'asc' },
        take: CAP,
      });
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'workEmail', label: 'Work Email' },
          { key: 'phone', label: 'Phone' }, { key: 'department', label: 'Department' }, { key: 'designation', label: 'Designation' },
          { key: 'site', label: 'Work Site' }, { key: 'manager', label: 'Manager' },
          { key: 'employmentType', label: 'Type' }, { key: 'status', label: 'Status' }, { key: 'dateOfJoining', label: 'Joined' },
        ],
        rows: rows.map((e) => ({
          employeeCode: e.employeeCode, name: `${e.firstName} ${e.lastName}`, workEmail: e.workEmail ?? '', phone: e.phone ?? '',
          department: e.department?.name ?? '', designation: e.designation?.title ?? '', site: e.location?.name ?? '',
          manager: e.manager ? `${e.manager.firstName} ${e.manager.lastName}` : '',
          employmentType: e.employmentType, status: e.status, dateOfJoining: iso(e.dateOfJoining),
        })),
      };
    },
  },
  {
    key: 'emp-headcount',
    title: 'Headcount Movement',
    description: 'Joiners, leavers and net change by department over a period.',
    module: 'Employees',
    params: ['range'],
    async build(ctx) {
      const { gte, lte } = period(ctx);
      const end = new Date(lte.getTime() + 86_399_000);
      const [joiners, leavers, current] = await Promise.all([
        ctx.prisma.employee.findMany({
          where: { organizationId: ctx.orgId, deletedAt: null, dateOfJoining: { gte, lte: end } },
          select: { departmentId: true, department: { select: { name: true } } },
        }),
        ctx.prisma.employee.findMany({
          where: { organizationId: ctx.orgId, deletedAt: null, status: { in: ['resigned', 'terminated'] }, updatedAt: { gte, lte: end } },
          select: { departmentId: true, department: { select: { name: true } } },
        }),
        ctx.prisma.employee.groupBy({
          by: ['departmentId'],
          where: { organizationId: ctx.orgId, deletedAt: null, status: 'active' },
          _count: { _all: true },
        }),
      ]);
      const names = new Map<string, string>();
      const j = new Map<string, number>(); const l = new Map<string, number>();
      for (const e of joiners) { const k = e.departmentId ?? '—'; names.set(k, e.department?.name ?? 'Unassigned'); j.set(k, (j.get(k) ?? 0) + 1); }
      for (const e of leavers) { const k = e.departmentId ?? '—'; names.set(k, e.department?.name ?? 'Unassigned'); l.set(k, (l.get(k) ?? 0) + 1); }
      const cur = new Map(current.map((c) => [c.departmentId ?? '—', c._count._all]));
      for (const k of cur.keys()) if (!names.has(k)) names.set(k, 'Unassigned');
      const depts = await ctx.prisma.department.findMany({ where: { organizationId: ctx.orgId, deletedAt: null }, select: { id: true, name: true } });
      for (const d of depts) names.set(d.id, d.name);
      return {
        columns: [
          { key: 'department', label: 'Department' }, { key: 'joiners', label: 'Joiners' },
          { key: 'leavers', label: 'Leavers' }, { key: 'net', label: 'Net Change' }, { key: 'headcount', label: 'Current Headcount' },
        ],
        rows: [...names.keys()].map((k) => {
          const jj = j.get(k) ?? 0, ll = l.get(k) ?? 0;
          return { department: names.get(k), joiners: jj, leavers: ll, net: jj - ll, headcount: cur.get(k) ?? 0 };
        }).sort((a, b) => String(a.department).localeCompare(String(b.department))),
      };
    },
  },
  {
    key: 'emp-diversity',
    title: 'Workforce Composition',
    description: 'Gender split, employment type and tenure bands by department.',
    module: 'Employees',
    params: ['department'],
    async build(ctx) {
      const rows = await ctx.prisma.employee.findMany({
        where: { ...empFilter(ctx), status: 'active' },
        select: { gender: true, employmentType: true, dateOfJoining: true, department: { select: { name: true } } },
        take: CAP,
      });
      const key = (r: (typeof rows)[number]) => r.department?.name ?? 'Unassigned';
      const acc = new Map<string, Record<string, number>>();
      const now = Date.now();
      for (const r of rows) {
        const a = acc.get(key(r)) ?? { total: 0, male: 0, female: 0, other: 0, fullTime: 0, contract: 0, t0: 0, t1: 0, t3: 0 };
        a.total++;
        if (r.gender === 'male') a.male++; else if (r.gender === 'female') a.female++; else a.other++;
        if (r.employmentType === 'full_time') a.fullTime++; else a.contract++;
        const yrs = r.dateOfJoining ? (now - r.dateOfJoining.getTime()) / 31_557_600_000 : 0;
        if (yrs < 1) a.t0++; else if (yrs < 3) a.t1++; else a.t3++;
        acc.set(key(r), a);
      }
      return {
        columns: [
          { key: 'department', label: 'Department' }, { key: 'total', label: 'Headcount' },
          { key: 'male', label: 'Male' }, { key: 'female', label: 'Female' }, { key: 'other', label: 'Other / Unspecified' },
          { key: 'fullTime', label: 'Full-time' }, { key: 'contract', label: 'Other Contract' },
          { key: 't0', label: '<1 yr' }, { key: 't1', label: '1–3 yrs' }, { key: 't3', label: '3+ yrs' },
        ],
        rows: [...acc.entries()].map(([department, a]) => ({ department, ...a })).sort((x, y) => x.department.localeCompare(y.department)),
      };
    },
  },

  {
    key: 'lv-balance',
    title: 'Leave Balance Sheet',
    description: 'Entitled, taken and remaining days per employee and leave type.',
    module: 'Leave',
    params: ['department'],
    async build(ctx) {
      const rows = await ctx.prisma.leaveBalance.findMany({
        where: { organizationId: ctx.orgId, ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}) },
        include: {
          employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
          leaveType: { select: { name: true } },
        },
        orderBy: [{ employee: { firstName: 'asc' } }],
        take: CAP,
      });
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' }, { key: 'department', label: 'Department' },
          { key: 'leaveType', label: 'Leave Type' }, { key: 'year', label: 'Year' },
          { key: 'entitled', label: 'Entitled' }, { key: 'taken', label: 'Taken' }, { key: 'remaining', label: 'Remaining' },
        ],
        rows: rows.map((b) => {
          const entitled = Number(b.entitled ?? 0);
          const taken = Number(b.taken ?? 0);
          return {
            employeeCode: b.employee?.employeeCode ?? '',
            name: b.employee ? `${b.employee.firstName} ${b.employee.lastName}` : '',
            department: b.employee?.department?.name ?? '',
            leaveType: b.leaveType?.name ?? '', year: b.year,
            entitled, taken, remaining: Math.max(0, entitled - taken),
          };
        }),
      };
    },
  },
  {
    key: 'lv-requests',
    title: 'Leave Request Log',
    description: 'Every leave request in the period with status, days and approver.',
    module: 'Leave',
    params: ['range', 'department', 'status'],
    async build(ctx) {
      const { gte, lte } = period(ctx);
      const rows = await ctx.prisma.leaveRequest.findMany({
        where: {
          organizationId: ctx.orgId, deletedAt: null,
          startDate: { gte, lte: new Date(lte.getTime() + 86_399_000) },
          ...(ctx.status ? { status: ctx.status as never } : {}),
          ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}),
        },
        include: {
          employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
          leaveType: { select: { name: true, isPaid: true } },
        },
        orderBy: { startDate: 'desc' },
        take: CAP,
      });
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' }, { key: 'department', label: 'Department' },
          { key: 'leaveType', label: 'Leave Type' }, { key: 'paid', label: 'Paid' },
          { key: 'startDate', label: 'From' }, { key: 'endDate', label: 'To' }, { key: 'days', label: 'Days' },
          { key: 'status', label: 'Status' }, { key: 'reason', label: 'Reason' },
        ],
        rows: rows.map((r) => ({
          employeeCode: r.employee?.employeeCode ?? '',
          name: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
          department: r.employee?.department?.name ?? '',
          leaveType: r.leaveType?.name ?? '', paid: r.leaveType?.isPaid ? 'Yes' : 'No',
          startDate: iso(r.startDate), endDate: iso(r.endDate), days: Number(r.days ?? 0),
          status: r.status, reason: r.reason ?? '',
        })),
      };
    },
  },
  {
    key: 'lv-liability',
    title: 'Leave Liability',
    description: 'Outstanding paid-leave days by department — the encashment exposure.',
    module: 'Leave',
    params: ['department'],
    async build(ctx) {
      const rows = await ctx.prisma.leaveBalance.findMany({
        where: {
          organizationId: ctx.orgId,
          leaveType: { isPaid: true },
          ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}),
        },
        include: { employee: { select: { department: { select: { name: true } } } } },
        take: CAP,
      });
      const acc = new Map<string, { employees: Set<string>; days: number }>();
      for (const b of rows) {
        const dept = b.employee?.department?.name ?? 'Unassigned';
        const a = acc.get(dept) ?? { employees: new Set<string>(), days: 0 };
        a.employees.add(b.employeeId);
        a.days += Math.max(0, Number(b.entitled ?? 0) - Number(b.taken ?? 0));
        acc.set(dept, a);
      }
      return {
        columns: [
          { key: 'department', label: 'Department' }, { key: 'employees', label: 'Employees' },
          { key: 'outstandingDays', label: 'Outstanding Paid Days' }, { key: 'avgPerEmployee', label: 'Avg per Employee' },
        ],
        rows: [...acc.entries()].map(([department, a]) => ({
          department, employees: a.employees.size,
          outstandingDays: Math.round(a.days * 10) / 10,
          avgPerEmployee: a.employees.size ? Math.round((a.days / a.employees.size) * 10) / 10 : 0,
        })).sort((x, y) => y.outstandingDays - x.outstandingDays),
      };
    },
  },
  {
    key: 'pay-register',
    title: 'Payroll Register',
    description: 'Gross, deductions and net pay per employee for a finalized month.',
    module: 'Payroll',
    params: ['month'],
    async build(ctx) {
      const { gte } = period(ctx);
      const year = gte.getUTCFullYear();
      const month = gte.getUTCMonth() + 1;
      const rows = await ctx.prisma.payslip.findMany({
        where: { organizationId: ctx.orgId, year, month },
        include: { employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } } },
        orderBy: [{ employee: { firstName: 'asc' } }],
        take: CAP,
      });
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' }, { key: 'department', label: 'Department' },
          { key: 'period', label: 'Period' }, { key: 'compensationType', label: 'Pay Type' },
          { key: 'gross', label: 'Gross (IDR)' }, { key: 'deductions', label: 'Deductions (IDR)' }, { key: 'net', label: 'Net Pay (IDR)' },
        ],
        rows: rows.map((p) => ({
          employeeCode: p.employee?.employeeCode ?? '',
          name: p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : '',
          department: p.employee?.department?.name ?? '',
          period: `${p.year}-${String(p.month).padStart(2, '0')}`,
          compensationType: p.compensationType ?? '',
          gross: Number(p.grossAmount ?? 0), deductions: Number(p.deductions ?? 0), net: Number(p.netAmount ?? 0),
        })),
      };
    },
  },
  {
    key: 'perf-cycle',
    title: 'Appraisal Cycle Status',
    description: 'Review completion and average scores by cycle and reviewer.',
    module: 'Performance',
    params: ['department'],
    async build(ctx) {
      const rows = await ctx.prisma.performanceReview.findMany({
        where: { organizationId: ctx.orgId, deletedAt: null, ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}) },
        include: {
          employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
          cycle: { select: { name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: CAP,
      });
      const reviewers = new Map(
        (await ctx.prisma.employee.findMany({
          where: { id: { in: rows.map((r) => r.reviewerId).filter((x): x is string => !!x) } },
          select: { id: true, firstName: true, lastName: true },
        })).map((e) => [e.id, `${e.firstName} ${e.lastName}`]),
      );
      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' }, { key: 'department', label: 'Department' },
          { key: 'cycle', label: 'Cycle' }, { key: 'reviewer', label: 'Reviewer' },
          { key: 'status', label: 'Status' }, { key: 'score', label: 'Overall Score' }, { key: 'updatedAt', label: 'Last Updated' },
        ],
        rows: rows.map((r) => ({
          employeeCode: r.employee?.employeeCode ?? '',
          name: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
          department: r.employee?.department?.name ?? '',
          cycle: r.cycle?.name ?? '', reviewer: reviewers.get(r.reviewerId ?? '') ?? '',
          status: r.status, score: r.overallScore != null ? Number(r.overallScore) : '',
          updatedAt: iso(r.updatedAt),
        })),
      };
    },
  },
  {
    key: 'perf-goals',
    title: 'Goal Attainment',
    description: 'Progress against each goal, with owner and status.',
    module: 'Performance',
    params: [],
    async build(ctx) {
      const rows = await ctx.prisma.goal.findMany({
        where: { organizationId: ctx.orgId, deletedAt: null },
        include: { employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } } },
        orderBy: { dueDate: 'asc' },
        take: CAP,
      });
      return {
        columns: [
          { key: 'title', label: 'Goal' }, { key: 'owner', label: 'Owner' }, { key: 'department', label: 'Department' },
          { key: 'metric', label: 'Metric' }, { key: 'target', label: 'Target' }, { key: 'current', label: 'Current' },
          { key: 'attainment', label: 'Attainment %' }, { key: 'status', label: 'Status' }, { key: 'dueDate', label: 'Due' },
        ],
        rows: rows.map((g) => {
          const target = Number(g.targetValue ?? 0);
          const current = Number(g.currentValue ?? 0);
          return {
            title: g.title, owner: g.employee ? `${g.employee.firstName} ${g.employee.lastName}` : '',
            department: g.employee?.department?.name ?? '',
            metric: g.metric ?? '', target, current,
            attainment: target > 0 ? Math.round((current / target) * 1000) / 10 : 0,
            status: g.status, dueDate: iso(g.dueDate),
          };
        }),
      };
    },
  },
  {
    key: 'perf-scorecard',
    title: 'Performance Scorecard',
    description:
      'Measured performance for a period, computed from delivered tasks and attendance rather than from appraisal ratings.',
    module: 'Performance',
    params: ['month', 'department'],
    async build(ctx) {
      const p = period(ctx);
      const staff = await ctx.prisma.employee.findMany({
        where: empFilter(ctx),
        select: {
          id: true, employeeCode: true, firstName: true, lastName: true, dateOfJoining: true,
          department: { select: { name: true } }, designation: { select: { title: true } },
        },
        orderBy: [{ firstName: 'asc' }],
        take: CAP,
      });
      const ids = staff.map((e) => e.id);

      // A task counts against the person it is assigned to, in the period it
      // was DUE — not the period it happened to be created in, or the reviewer
      // would be scoring work that was never this month's to deliver.
      const assignments = ids.length
        ? await ctx.prisma.taskAssignment.findMany({
            where: {
              employeeId: { in: ids },
              task: {
                organizationId: ctx.orgId,
                deletedAt: null,
                OR: [
                  { dueDate: { gte: p.gte, lte: p.lte } },
                  { completedAt: { gte: p.gte, lte: p.lte } },
                ],
              },
            },
            select: {
              employeeId: true,
              task: { select: { status: true, dueDate: true, completedAt: true } },
            },
            take: CAP * 4,
          })
        : [];

      const days = ids.length
        ? await ctx.prisma.attendanceDay.findMany({
            where: { organizationId: ctx.orgId, employeeId: { in: ids }, workDate: { gte: p.gte, lte: p.lte } },
            select: { employeeId: true, status: true, lateMinutes: true, workedMinutes: true, overtimeMinutes: true },
            take: CAP * 4,
          })
        : [];

      type Tally = {
        due: number; completed: number; onTime: number; late: number; open: number;
        scheduled: number; attended: number; lateDays: number; absent: number; leave: number; minutes: number; overtime: number;
      };
      const blank = (): Tally => ({
        due: 0, completed: 0, onTime: 0, late: 0, open: 0,
        scheduled: 0, attended: 0, lateDays: 0, absent: 0, leave: 0, minutes: 0, overtime: 0,
      });
      const tally = new Map<string, Tally>(ids.map((id) => [id, blank()]));

      for (const a of assignments) {
        const t = tally.get(a.employeeId);
        if (!t) continue;
        const { status, dueDate, completedAt } = a.task;
        const dueInPeriod = dueDate != null && dueDate >= p.gte && dueDate <= p.lte;
        const doneInPeriod = completedAt != null && completedAt >= p.gte && completedAt <= p.lte;
        if (dueInPeriod) t.due += 1;
        if (doneInPeriod) t.completed += 1;
        if (doneInPeriod && dueDate != null) {
          if (completedAt! <= dueDate) t.onTime += 1;
          else t.late += 1;
        }
        // Still owed: was due in this period, and nothing has closed it.
        if (dueInPeriod && completedAt == null && status !== 'done' && status !== 'cancelled') t.open += 1;
      }

      for (const d of days) {
        const t = tally.get(d.employeeId);
        if (!t) continue;
        // Days off are not opportunities to attend, so they must not dilute the rate.
        if (d.status === 'weekly_off' || d.status === 'holiday') continue;
        t.scheduled += 1;
        if (d.status === 'on_leave') { t.leave += 1; continue; }
        if (d.status === 'absent') { t.absent += 1; continue; }
        t.attended += d.status === 'half_day' ? 0.5 : 1;
        if (d.status === 'late' || d.lateMinutes > 0) t.lateDays += 1;
        t.minutes += d.workedMinutes;
        t.overtime += d.overtimeMinutes;
      }

      const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 1000) / 10 : '');

      return {
        columns: [
          { key: 'employeeCode', label: 'Code' }, { key: 'name', label: 'Employee' },
          { key: 'department', label: 'Department' }, { key: 'designation', label: 'Designation' },
          { key: 'joined', label: 'Joined' }, { key: 'tenureMonths', label: 'Tenure (months)' },
          { key: 'tasksDue', label: 'Tasks Due' }, { key: 'tasksCompleted', label: 'Tasks Completed' },
          { key: 'onTime', label: 'On Time' }, { key: 'overdue', label: 'Overdue' },
          { key: 'onTimeRate', label: 'On-Time %' },
          { key: 'scheduledDays', label: 'Scheduled Days' }, { key: 'daysAttended', label: 'Days Attended' },
          { key: 'lateDays', label: 'Late Days' }, { key: 'absentDays', label: 'Absent Days' },
          { key: 'leaveDays', label: 'Leave Days' }, { key: 'hoursWorked', label: 'Hours Worked' },
          { key: 'overtimeHours', label: 'Overtime Hours' },
          { key: 'attendanceRate', label: 'Attendance %' },
          { key: 'score', label: 'Score' }, { key: 'basis', label: 'Score Basis' },
        ],
        rows: staff.map((e) => {
          const t = tally.get(e.id) ?? blank();
          const attRate = t.scheduled > 0 ? t.attended / t.scheduled : null;
          const taskRate = t.due > 0 ? t.onTime / t.due : null;
          // Half the score is delivery, half is presence — but only for people
          // who were actually given tasks. Scoring a teller who is never
          // assigned any at 0% delivery would be a measurement artefact, not a
          // performance finding, so attendance carries the whole weight there.
          const score =
            taskRate != null && attRate != null ? 0.5 * taskRate + 0.5 * attRate
            : taskRate ?? attRate;
          return {
            employeeCode: e.employeeCode,
            name: `${e.firstName} ${e.lastName}`,
            department: e.department?.name ?? '',
            designation: e.designation?.title ?? '',
            joined: iso(e.dateOfJoining),
            tenureMonths: tenureMonths(e.dateOfJoining, p.lte),
            tasksDue: t.due, tasksCompleted: t.completed, onTime: t.onTime, overdue: t.open,
            onTimeRate: pct(t.onTime, t.due),
            scheduledDays: t.scheduled, daysAttended: t.attended, lateDays: t.lateDays,
            absentDays: t.absent, leaveDays: t.leave,
            hoursWorked: (t.minutes / 60).toFixed(2), overtimeHours: (t.overtime / 60).toFixed(2),
            attendanceRate: pct(t.attended, t.scheduled),
            score: score != null ? Math.round(score * 1000) / 10 : '',
            basis: taskRate != null && attRate != null ? 'tasks + attendance'
              : taskRate != null ? 'tasks only'
              : attRate != null ? 'attendance only'
              : 'no data',
          };
        }),
      };
    },
  },
  {
    key: 'asset-register',
    title: 'Asset Register',
    description: 'Every asset with its tag, category, status, current holder and purchase details.',
    module: 'Assets',
    params: ['department'],
    async build(ctx) {
      const rows = await ctx.prisma.asset.findMany({
        where: {
          organizationId: ctx.orgId,
          deletedAt: null,
          // Filtering by department necessarily narrows this to assets that are
          // currently held by someone in it — an unassigned laptop belongs to no
          // department.
          ...(ctx.departmentId ? { assignedTo: { departmentId: ctx.departmentId } } : {}),
        },
        include: {
          assignedTo: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
        },
        orderBy: [{ category: 'asc' }, { assetTag: 'asc' }],
        take: CAP,
      });
      const today = new Date();
      return {
        columns: [
          { key: 'assetTag', label: 'Asset Tag' }, { key: 'name', label: 'Asset' }, { key: 'category', label: 'Category' },
          { key: 'serialNumber', label: 'Serial No.' }, { key: 'status', label: 'Status' }, { key: 'condition', label: 'Condition' },
          { key: 'holderCode', label: 'Holder Code' }, { key: 'holder', label: 'Assigned To' }, { key: 'department', label: 'Department' },
          { key: 'purchaseDate', label: 'Purchased' }, { key: 'purchaseCost', label: 'Cost' }, { key: 'vendor', label: 'Vendor' },
          { key: 'warrantyUntil', label: 'Warranty Until' }, { key: 'warranty', label: 'Warranty' },
        ],
        rows: rows.map((a) => ({
          assetTag: a.assetTag, name: a.name, category: a.category,
          serialNumber: a.serialNumber ?? '', status: a.status, condition: a.condition ?? '',
          holderCode: a.assignedTo?.employeeCode ?? '',
          holder: a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : '',
          department: a.assignedTo?.department?.name ?? '',
          purchaseDate: iso(a.purchaseDate), purchaseCost: a.purchaseCost != null ? Number(a.purchaseCost) : '',
          vendor: a.vendor ?? '', warrantyUntil: iso(a.warrantyUntil),
          warranty: a.warrantyUntil ? (a.warrantyUntil >= today ? 'in warranty' : 'expired') : '',
        })),
      };
    },
  },
  {
    key: 'asset-assignments',
    title: 'Asset Assignment & Return Log',
    description: 'Assets handed out or returned in the period, and what is still outstanding.',
    module: 'Assets',
    params: ['range', 'department'],
    async build(ctx) {
      const p = period(ctx);
      const rows = await ctx.prisma.assetAssignment.findMany({
        where: {
          organizationId: ctx.orgId,
          // An item issued last year and returned this month belongs in this
          // month's log, so either end of the movement qualifies.
          OR: [{ assignedAt: { gte: p.gte, lte: p.lte } }, { returnedAt: { gte: p.gte, lte: p.lte } }],
          ...(ctx.departmentId ? { employee: { departmentId: ctx.departmentId } } : {}),
        },
        include: {
          asset: { select: { assetTag: true, name: true, category: true, status: true } },
          employee: { select: { employeeCode: true, firstName: true, lastName: true, department: { select: { name: true } } } },
        },
        orderBy: { assignedAt: 'desc' },
        take: CAP,
      });
      const today = new Date();
      const DAY = 24 * 60 * 60 * 1000;
      return {
        columns: [
          { key: 'assetTag', label: 'Asset Tag' }, { key: 'asset', label: 'Asset' }, { key: 'category', label: 'Category' },
          { key: 'employeeCode', label: 'Code' }, { key: 'employee', label: 'Employee' }, { key: 'department', label: 'Department' },
          { key: 'assignedAt', label: 'Issued' }, { key: 'conditionOut', label: 'Condition Out' },
          { key: 'returnedAt', label: 'Returned' }, { key: 'conditionIn', label: 'Condition In' },
          { key: 'daysHeld', label: 'Days Held' }, { key: 'outstanding', label: 'Outstanding' },
        ],
        rows: rows.map((r) => {
          const end = r.returnedAt ?? today;
          return {
            assetTag: r.asset?.assetTag ?? '', asset: r.asset?.name ?? '', category: r.asset?.category ?? '',
            employeeCode: r.employee?.employeeCode ?? '',
            employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
            department: r.employee?.department?.name ?? '',
            assignedAt: iso(r.assignedAt), conditionOut: r.conditionOut ?? '',
            returnedAt: iso(r.returnedAt), conditionIn: r.conditionIn ?? '',
            daysHeld: Math.max(0, Math.floor((end.getTime() - r.assignedAt.getTime()) / DAY)),
            outstanding: r.returnedAt ? 'no' : 'yes',
          };
        }),
      };
    },
  },
];

/** Whole months between joining and the end of the reported period. */
function tenureMonths(joined: Date | null | undefined, asOf: Date): number | '' {
  if (!joined) return '';
  const months =
    (asOf.getUTCFullYear() - joined.getUTCFullYear()) * 12 + (asOf.getUTCMonth() - joined.getUTCMonth());
  return Math.max(0, asOf.getUTCDate() >= joined.getUTCDate() ? months : months - 1);
}
