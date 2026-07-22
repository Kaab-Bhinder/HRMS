import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ScopeService } from '../access/scope.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/**
 * Fixed hourly payroll, computed live from attendance. Each present day pays
 * `min(workedMinutes, officeMinutesPerDay) × payPerHour` — an employee can never
 * be paid for more than the office day (no overtime pay). Monthly; for the
 * current month it also projects the full-month figure so admins see progress.
 *
 * Scoped exactly like attendance: admins/HR see everyone, a department head sees
 * their team, an employee sees only themselves.
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
        select: { id: true, firstName: true, lastName: true, employeeCode: true, payPerHour: true, department: { select: { name: true } } },
        orderBy: { firstName: 'asc' },
      }),
      this.officeMinutesPerDay(user.organizationId),
      this.weeklyOffDays(user.organizationId),
    ]);
    const holidays = await this.monthHolidays(user.organizationId, start, end);

    const days = await this.prisma.attendanceDay.findMany({
      where: { organizationId: user.organizationId, workDate: { gte: start, lte: end }, employeeId: { in: employees.map((e) => e.id) } },
      select: { employeeId: true, status: true, workedMinutes: true, lateMinutes: true, isFlagged: true },
    });
    const byEmp = new Map<string, typeof days>();
    for (const d of days) (byEmp.get(d.employeeId) ?? byEmp.set(d.employeeId, []).get(d.employeeId)!).push(d);

    const workingDaysTotal = workingDaysInMonth(year, month, weeklyOff, holidays);
    return {
      year,
      month,
      currency: await this.currency(user.organizationId),
      officeHoursPerDay: round2(officeMinutes / 60),
      workingDaysTotal,
      rows: employees.map((e) => this.summarize(e, byEmp.get(e.id) ?? [], officeMinutes, workingDaysTotal)),
    };
  }

  /** Detailed payslip for one employee (self/team/org scoped). */
  async payslip(user: AuthUser, employeeId: string, year: number, month: number) {
    await this.assertCanSee(user, employeeId);
    const { start, end } = monthRange(year, month);
    const [emp, officeMinutes, weeklyOff] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, organizationId: user.organizationId },
        select: { id: true, firstName: true, lastName: true, employeeCode: true, payPerHour: true, department: { select: { name: true } }, designation: { select: { title: true } } },
      }),
      this.officeMinutesPerDay(user.organizationId),
      this.weeklyOffDays(user.organizationId),
    ]);
    if (!emp) throw new NotFoundException('Employee not found');
    const holidays = await this.monthHolidays(user.organizationId, start, end);

    const days = await this.prisma.attendanceDay.findMany({
      where: { organizationId: user.organizationId, employeeId, workDate: { gte: start, lte: end } },
      orderBy: { workDate: 'asc' },
    });
    const workingDaysTotal = workingDaysInMonth(year, month, weeklyOff, holidays);
    const summary = this.summarize(emp, days, officeMinutes, workingDaysTotal);

    return {
      ...summary,
      currency: await this.currency(user.organizationId),
      year,
      month,
      officeHoursPerDay: round2(officeMinutes / 60),
      workingDaysTotal,
      designationName: emp.designation?.title ?? null,
      days: days.map((d) => {
        const payable = payableMinutes(d.status, d.workedMinutes, officeMinutes);
        return {
          workDate: d.workDate,
          status: d.status,
          workedMinutes: d.workedMinutes,
          payableMinutes: payable,
          lateMinutes: d.lateMinutes,
          isFlagged: d.isFlagged,
          pay: emp.payPerHour ? round2((payable / 60) * Number(emp.payPerHour)) : 0,
        };
      }),
    };
  }

  // --- helpers ---

  private summarize(
    emp: { id: string; firstName: string; lastName: string; employeeCode: string; payPerHour: Prisma.Decimal | null; department: { name: string } | null },
    days: { status: string; workedMinutes: number; lateMinutes: number; isFlagged: boolean }[],
    officeMinutes: number,
    workingDaysTotal: number,
  ) {
    const rate = emp.payPerHour ? Number(emp.payPerHour) : 0;
    let payMinutes = 0;
    let workedMinutes = 0;
    let lateMinutes = 0;
    let present = 0;
    let absent = 0;
    let flagged = 0;
    for (const d of days) {
      workedMinutes += d.workedMinutes;
      lateMinutes += d.lateMinutes;
      if (d.isFlagged) flagged += 1;
      if (d.status === 'absent') absent += 1;
      if (['present', 'late', 'half_day'].includes(d.status)) present += 1;
      payMinutes += payableMinutes(d.status, d.workedMinutes, officeMinutes);
    }
    const earnedPay = round2((payMinutes / 60) * rate);
    // Potential full-month pay if every working day were a full office day.
    const potentialPay = round2((officeMinutes / 60) * workingDaysTotal * rate);
    return {
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      departmentName: emp.department?.name ?? null,
      payPerHour: rate || null,
      payableHours: round2(payMinutes / 60),
      workedHours: round2(workedMinutes / 60),
      lateMinutes,
      daysPresent: present,
      daysAbsent: absent,
      daysFlagged: flagged,
      earnedPay,
      potentialPay,
      progressPct: potentialPay > 0 ? Math.min(100, Math.round((earnedPay / potentialPay) * 100)) : 0,
    };
  }

  private async assertCanSee(user: AuthUser, employeeId: string) {
    const dataScope = await this.scope.resolve(user);
    if (dataScope.kind === 'org') return;
    if (dataScope.kind === 'self') {
      if (dataScope.employeeId !== employeeId) throw new BadRequestException('You can only view your own payslip');
      return;
    }
    const emp = await this.prisma.employee.findFirst({ where: { id: employeeId, departmentId: { in: dataScope.departmentIds } }, select: { id: true } });
    if (!emp) throw new BadRequestException('This employee is not in your team');
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
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
