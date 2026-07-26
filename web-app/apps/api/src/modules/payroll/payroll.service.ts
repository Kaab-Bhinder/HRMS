import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, CompensationType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ScopeService } from '../access/scope.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/**
 * Payroll for two compensation models, computed live from attendance & leave:
 *
 *  • hourly  — each present day pays `min(workedMinutes, officeMinutesPerDay) ×
 *    payPerHour`; an employee is never paid for more than the office day (no
 *    overtime pay). Net = earned pay.
 *  • monthly — a fixed `basicSalary`; the only thing that reduces it is
 *    **unpaid leave** (approved leave whose type has isPaid = false). Each
 *    unpaid-leave working day deducts `basicSalary ÷ workingDaysInMonth`.
 *    Paid leave, holidays and weekly-offs never deduct. (v1 deliberately omits
 *    tax / statutory deductions / bonuses / overtime.)
 *
 * A finalized month is frozen: `finalize()` writes an immutable Payslip
 * snapshot per employee, and from then on the register/payslip return the
 * snapshot figures rather than recomputing — so history never moves when a
 * salary or compensation type later changes.
 *
 * Scoped exactly like attendance: admins/HR see everyone, a department head
 * sees their team, an employee sees only themselves.
 */
@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ScopeService,
  ) {}

  /** Payroll register for a month: one summarized row per in-scope employee. */
  async register(user: AuthUser, year: number, month: number) {
    const dataScope = await this.scope.resolve(user);
    const { start, end } = monthRange(year, month);
    const [employees, officeMinutes, weeklyOff] = await Promise.all([
      this.prisma.employee.findMany({
        where: { organizationId: user.organizationId, deletedAt: null, ...this.scope.employeeWhere(dataScope) },
        select: empSelect,
        orderBy: { firstName: 'asc' },
      }),
      this.officeMinutesPerDay(user.organizationId),
      this.weeklyOffDays(user.organizationId),
    ]);
    const empIds = employees.map((e) => e.id);
    const holidays = await this.monthHolidays(user.organizationId, start, end);
    const workingDaysTotal = workingDaysInMonth(year, month, weeklyOff, holidays);

    const [days, unpaidMap, finalized] = await Promise.all([
      this.prisma.attendanceDay.findMany({
        where: { organizationId: user.organizationId, workDate: { gte: start, lte: end }, employeeId: { in: empIds } },
        select: { employeeId: true, status: true, workedMinutes: true, lateMinutes: true, isFlagged: true },
      }),
      this.unpaidLeaveDaysByEmployee(user.organizationId, empIds, start, end, weeklyOff, holidays),
      this.finalizedByEmployee(user.organizationId, empIds, year, month),
    ]);
    const byEmp = new Map<string, typeof days>();
    for (const d of days) (byEmp.get(d.employeeId) ?? byEmp.set(d.employeeId, []).get(d.employeeId)!).push(d);

    return {
      year,
      month,
      currency: await this.currency(user.organizationId),
      officeHoursPerDay: round2(officeMinutes / 60),
      workingDaysTotal,
      rows: employees.map((e) =>
        this.overlayFinalized(
          this.summarize(e, byEmp.get(e.id) ?? [], officeMinutes, workingDaysTotal, unpaidMap.get(e.id) ?? 0),
          finalized.get(e.id),
        ),
      ),
    };
  }

  /** Detailed payslip for one employee (self/team/org scoped). */
  async payslip(user: AuthUser, employeeId: string, year: number, month: number) {
    await this.assertCanSee(user, employeeId);
    const { start, end } = monthRange(year, month);
    const [emp, officeMinutes, weeklyOff] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, organizationId: user.organizationId },
        select: { ...empSelect, designation: { select: { title: true } } },
      }),
      this.officeMinutesPerDay(user.organizationId),
      this.weeklyOffDays(user.organizationId),
    ]);
    if (!emp) throw new NotFoundException('Employee not found');
    const holidays = await this.monthHolidays(user.organizationId, start, end);
    const workingDaysTotal = workingDaysInMonth(year, month, weeklyOff, holidays);

    const [days, unpaidMap, finalized] = await Promise.all([
      this.prisma.attendanceDay.findMany({
        where: { organizationId: user.organizationId, employeeId, workDate: { gte: start, lte: end } },
        orderBy: { workDate: 'asc' },
      }),
      this.unpaidLeaveDaysByEmployee(user.organizationId, [employeeId], start, end, weeklyOff, holidays),
      this.finalizedByEmployee(user.organizationId, [employeeId], year, month),
    ]);
    const summary = this.overlayFinalized(
      this.summarize(emp, days, officeMinutes, workingDaysTotal, unpaidMap.get(employeeId) ?? 0),
      finalized.get(employeeId),
    );

    return {
      ...summary,
      currency: await this.currency(user.organizationId),
      year,
      month,
      officeHoursPerDay: round2(officeMinutes / 60),
      workingDaysTotal,
      designationName: emp.designation?.title ?? null,
      // Per-day breakdown is meaningful for hourly (pay accrues daily). For
      // monthly the daily "pay" column is 0 — the day list is just the
      // attendance record; deductions are driven by unpaid leave, not by day.
      days: days.map((d) => {
        const payable = payableMinutes(d.status, d.workedMinutes, officeMinutes);
        return {
          workDate: d.workDate,
          status: d.status,
          workedMinutes: d.workedMinutes,
          payableMinutes: payable,
          lateMinutes: d.lateMinutes,
          isFlagged: d.isFlagged,
          pay: emp.compensationType === CompensationType.monthly ? 0 : emp.payPerHour ? round2((payable / 60) * Number(emp.payPerHour)) : 0,
        };
      }),
    };
  }

  /**
   * Finalizes payroll for a month: writes an immutable Payslip snapshot for
   * every in-scope employee that doesn't already have one. Idempotent — rerun
   * to snapshot employees added since the last run; already-finalized months
   * are left untouched (that's what keeps history stable).
   */
  async finalize(user: AuthUser, year: number, month: number) {
    const now = new Date();
    if (year > now.getUTCFullYear() || (year === now.getUTCFullYear() && month > now.getUTCMonth() + 1)) {
      throw new BadRequestException('Cannot finalize a future month');
    }
    const reg = await this.register(user, year, month);
    if (reg.rows.length === 0) throw new BadRequestException('No employees in scope to finalize');

    const alreadyDone = reg.rows.filter((r) => r.finalized);
    const toCreate = reg.rows.filter((r) => !r.finalized);

    if (toCreate.length > 0) {
      await this.prisma.payslip.createMany({
        data: toCreate.map((r) => ({
          organizationId: user.organizationId,
          employeeId: r.employeeId,
          year,
          month,
          compensationType: r.compensationType,
          currency: reg.currency,
          grossAmount: r.grossPay,
          deductions: r.deductions,
          netAmount: r.netPay,
          workingDays: reg.workingDaysTotal,
          paidDays: r.daysPresent,
          unpaidLeaveDays: r.unpaidLeaveDays,
          breakdown: r as unknown as Prisma.InputJsonValue,
          finalizedByUserId: user.id,
          finalizedByName: user.fullName,
        })),
        skipDuplicates: true, // race-safe against the (employeeId, year, month) unique index
      });
    }

    return { year, month, finalized: toCreate.length, alreadyFinalized: alreadyDone.length, total: reg.rows.length };
  }

  // --- helpers ---

  private summarize(emp: EmpRow, days: DayRow[], officeMinutes: number, workingDaysTotal: number, unpaidLeaveDays: number) {
    let workedMinutes = 0;
    let lateMinutes = 0;
    let present = 0;
    let absent = 0;
    let flagged = 0;
    let payMinutes = 0;
    for (const d of days) {
      workedMinutes += d.workedMinutes;
      lateMinutes += d.lateMinutes;
      if (d.isFlagged) flagged += 1;
      if (d.status === 'absent') absent += 1;
      if (['present', 'late', 'half_day'].includes(d.status)) present += 1;
      payMinutes += payableMinutes(d.status, d.workedMinutes, officeMinutes);
    }

    const monthly = emp.compensationType === CompensationType.monthly;
    const rate = emp.payPerHour ? Number(emp.payPerHour) : 0;
    const basic = emp.basicSalary ? Number(emp.basicSalary) : 0;

    // hourly figures
    const earnedPay = round2((payMinutes / 60) * rate);
    const potentialPay = round2((officeMinutes / 60) * workingDaysTotal * rate);

    // monthly figures — one unpaid-leave working day = basic ÷ workingDays
    const dailyRate = workingDaysTotal > 0 ? basic / workingDaysTotal : 0;
    const monthlyDeduction = monthly ? round2(dailyRate * unpaidLeaveDays) : 0;
    const monthlyNet = round2(basic - monthlyDeduction);

    // unified fields the UI reads regardless of type
    const grossPay = monthly ? basic : potentialPay;
    const deductions = monthly ? monthlyDeduction : 0;
    const netPay = monthly ? monthlyNet : earnedPay;
    const progressPct = monthly
      ? basic > 0 ? Math.max(0, Math.round((monthlyNet / basic) * 100)) : 0
      : potentialPay > 0 ? Math.min(100, Math.round((earnedPay / potentialPay) * 100)) : 0;

    return {
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      departmentName: emp.department?.name ?? null,
      compensationType: emp.compensationType,
      // hourly detail
      payPerHour: rate || null,
      payableHours: round2(payMinutes / 60),
      workedHours: round2(workedMinutes / 60),
      lateMinutes,
      daysPresent: present,
      daysAbsent: absent,
      daysFlagged: flagged,
      earnedPay,
      potentialPay,
      // monthly detail
      basicSalary: monthly ? basic || null : null,
      unpaidLeaveDays,
      // unified
      grossPay,
      deductions,
      netPay,
      progressPct,
      finalized: false as boolean,
      finalizedAt: null as Date | null,
    };
  }

  /** When a month is finalized, the snapshot is authoritative — return its
   *  frozen figures instead of the live recomputation. */
  private overlayFinalized(row: ReturnType<PayrollService['summarize']>, snap?: FinalizedSnap) {
    if (!snap) return row;
    return {
      ...row,
      grossPay: Number(snap.grossAmount),
      deductions: Number(snap.deductions),
      netPay: Number(snap.netAmount),
      unpaidLeaveDays: Number(snap.unpaidLeaveDays),
      finalized: true,
      finalizedAt: snap.finalizedAt,
    };
  }

  private async finalizedByEmployee(orgId: string, empIds: string[], year: number, month: number): Promise<Map<string, FinalizedSnap>> {
    const map = new Map<string, FinalizedSnap>();
    if (empIds.length === 0) return map;
    const rows = await this.prisma.payslip.findMany({
      where: { organizationId: orgId, year, month, employeeId: { in: empIds } },
      select: { employeeId: true, grossAmount: true, deductions: true, netAmount: true, unpaidLeaveDays: true, finalizedAt: true },
    });
    for (const r of rows) map.set(r.employeeId, r);
    return map;
  }

  /** Approved unpaid-leave working days per employee within the month. Counts
   *  only the portion of each leave that overlaps the month, and only days that
   *  are actual working days (excludes weekly-offs & holidays). */
  private async unpaidLeaveDaysByEmployee(
    orgId: string,
    empIds: string[],
    start: Date,
    end: Date,
    weeklyOff: number[],
    holidays: Set<string>,
  ): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    if (empIds.length === 0) return map;
    const reqs = await this.prisma.leaveRequest.findMany({
      where: {
        organizationId: orgId,
        employeeId: { in: empIds },
        status: 'approved',
        deletedAt: null,
        leaveType: { isPaid: false },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: { employeeId: true, startDate: true, endDate: true },
    });
    for (const r of reqs) {
      const from = r.startDate > start ? r.startDate : start;
      const to = r.endDate < end ? r.endDate : end;
      const dayCount = workingDaysBetween(from, to, weeklyOff, holidays);
      map.set(r.employeeId, (map.get(r.employeeId) ?? 0) + dayCount);
    }
    return map;
  }

  private async assertCanSee(user: AuthUser, employeeId: string) {
    const dataScope = await this.scope.resolve(user);
    if (dataScope.kind === 'org') return;
    if (dataScope.kind === 'self') {
      if (dataScope.employeeId !== employeeId) throw new ForbiddenException('You can only view your own payslip');
      return;
    }
    const emp = await this.prisma.employee.findFirst({ where: { id: employeeId, departmentId: { in: dataScope.departmentIds } }, select: { id: true } });
    if (!emp) throw new ForbiddenException('This employee is not in your team');
  }

  /** ISO currency for money in this payroll. Stored on the organization. */
  private async currency(orgId: string): Promise<string> {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: { currency: true },
    });
    return org?.currency ?? 'USD';
  }

  private async officeMinutesPerDay(orgId: string): Promise<number> {
    const shift = await this.prisma.shift.findFirst({ where: { organizationId: orgId, deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    if (!shift) return 480;
    if (shift.workMinutes && shift.workMinutes > 0) return shift.workMinutes;
    const [sh, sm] = shift.startTime.split(':').map(Number);
    const [eh, em] = shift.endTime.split(':').map(Number);
    let mins = eh * 60 + em - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return Math.max(0, mins - shift.breakMinutes);
  }

  private async weeklyOffDays(orgId: string): Promise<number[]> {
    const policy = await this.prisma.attendancePolicy.findFirst({ where: { organizationId: orgId, deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    return policy?.weeklyOffDays ?? [0, 6];
  }

  /** Set of holiday dates (YYYY-MM-DD) in the range — excluded from expected
   *  working days so a holiday never counts against pay progress. */
  private async monthHolidays(orgId: string, start: Date, end: Date): Promise<Set<string>> {
    const rows = await this.prisma.holiday.findMany({
      where: { organizationId: orgId, date: { gte: start, lte: end } },
      select: { date: true },
    });
    return new Set(rows.map((r) => r.date.toISOString().slice(0, 10)));
  }
}

const empSelect = {
  id: true,
  firstName: true,
  lastName: true,
  employeeCode: true,
  compensationType: true,
  basicSalary: true,
  payPerHour: true,
  department: { select: { name: true } },
} satisfies Prisma.EmployeeSelect;

type EmpRow = {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  compensationType: CompensationType;
  basicSalary: Prisma.Decimal | null;
  payPerHour: Prisma.Decimal | null;
  department: { name: string } | null;
};
type DayRow = { status: string; workedMinutes: number; lateMinutes: number; isFlagged: boolean };
type FinalizedSnap = {
  grossAmount: Prisma.Decimal;
  deductions: Prisma.Decimal;
  netAmount: Prisma.Decimal;
  unpaidLeaveDays: Prisma.Decimal;
  finalizedAt: Date;
};

function payableMinutes(status: string, workedMinutes: number, officeMinutes: number): number {
  if (!['present', 'late', 'half_day'].includes(status)) return 0;
  return Math.min(workedMinutes, officeMinutes);
}
function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0)); // last day of month
  return { start, end };
}
function workingDaysInMonth(year: number, month: number, weeklyOff: number[], holidays: Set<string> = new Set()): number {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(year, month - 1, d));
    if (weeklyOff.includes(date.getUTCDay())) continue;
    if (holidays.has(date.toISOString().slice(0, 10))) continue; // holidays aren't expected work
    count += 1;
  }
  return count;
}
/** Inclusive count of working days between two dates (weekly-offs & holidays excluded). */
function workingDaysBetween(from: Date, to: Date, weeklyOff: number[], holidays: Set<string>): number {
  let count = 0;
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const last = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  while (d <= last) {
    if (!weeklyOff.includes(d.getUTCDay()) && !holidays.has(d.toISOString().slice(0, 10))) count += 1;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return count;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
