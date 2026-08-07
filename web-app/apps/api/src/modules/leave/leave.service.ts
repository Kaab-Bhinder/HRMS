import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LeaveRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ApprovalService } from '../approvals/approval.service';
import { ScopeService } from '../access/scope.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginated } from '../../common/dto/pagination.dto';
import {
  CreateLeaveRequestDto, CreateLeaveTypeDto, QueryLeaveRequestsDto, UpdateLeaveTypeDto,
} from './dto/leave.dto';

const SUBJECT = 'leave_request';

@Injectable()
export class LeaveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
    private readonly scope: ScopeService,
    private readonly notifications: NotificationsService,
  ) {}

  // --- Leave types ---

  listTypes(orgId: string) {
    return this.prisma.leaveType.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  createType(orgId: string, dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.create({
      data: {
        organizationId: orgId,
        name: dto.name,
        code: dto.code,
        isPaid: dto.isPaid,
        accrualPerYear: dto.accrualPerYear,
        carryForwardMax: dto.carryForwardMax,
        allowNegative: dto.allowNegative,
        colorHex: dto.colorHex,
      },
    });
  }

  async updateType(orgId: string, id: string, dto: UpdateLeaveTypeDto) {
    const existing = await this.prisma.leaveType.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Leave type not found');
    return this.prisma.leaveType.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        isPaid: dto.isPaid,
        accrualPerYear: dto.accrualPerYear,
        carryForwardMax: dto.carryForwardMax,
        allowNegative: dto.allowNegative,
        colorHex: dto.colorHex,
      },
    });
  }

  async removeType(orgId: string, id: string) {
    const existing = await this.prisma.leaveType.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!existing) throw new NotFoundException('Leave type not found');
    await this.prisma.leaveType.update({ where: { id }, data: { deletedAt: new Date() } });
    return { success: true };
  }

  // --- Balances ---

  /**
   * This year's balance for every leave type, with the remaining allowance
   * computed.
   *
   * A type whose `accrualPerYear` is set (Annual) is ALLOTTED: the employee has
   * a fixed number of days and `remaining` counts down. A type with no accrual
   * (Sick) is ADDITIONAL: it does not draw on the annual allotment, so it has no
   * cap and `remaining` is reported as null.
   *
   * Balance rows are provisioned on read from the leave type's accrual, so an
   * employee who has never applied still sees the correct starting allowance
   * (the admin sets it in Attendance Settings → annual leave allowance).
   *
   * Two different numbers come out of this, and the distinction matters:
   *
   *  - `remaining` counts down only on APPROVAL. This is what the employee is
   *    shown: applying for leave never silently eats their balance, and a
   *    rejected request costs them nothing.
   *  - `available` also subtracts days already awaiting a decision, and is what
   *    `createRequest` validates against. Without it an employee with 17 days
   *    left could file two separate 17-day requests — both would pass the check
   *    while pending, and approving both would push the balance negative.
   */
  async balances(orgId: string, employeeId: string) {
    const year = this.currentYear();
    const types = await this.prisma.leaveType.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
    const rows = await this.prisma.leaveBalance.findMany({
      where: { organizationId: orgId, employeeId, year },
    });
    const byType = new Map(rows.map((r) => [r.leaveTypeId, r]));

    return types.map((t) => {
      const b = byType.get(t.id);
      const allotted = t.accrualPerYear != null ? Number(t.accrualPerYear) : null;
      const entitled = allotted ?? 0;
      const taken = b ? Number(b.taken) : 0;
      const pending = b ? Number(b.pending) : 0;
      const carriedForward = b ? Number(b.carriedForward) : 0;
      const remaining = allotted == null ? null : entitled + carriedForward - taken;
      return {
        employeeId,
        leaveTypeId: t.id,
        leaveType: t.name,
        year,
        // Null means "not capped" — an additional type such as Sick leave.
        allotted,
        entitled,
        taken,
        pending,
        carriedForward,
        // Deducted on approval only — the number the employee is shown.
        remaining,
        // What can still be requested right now (pending days are held back).
        available: remaining == null ? null : remaining - pending,
      };
    });
  }

  // --- Requests ---

  async listRequests(user: AuthUser, q: QueryLeaveRequestsDto) {
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    const where: Prisma.LeaveRequestWhereInput = {
      organizationId: orgId,
      deletedAt: null,
      // Role scope (admin/HR: all · head: their team · employee: self).
      AND: [this.scope.byEmployee(dataScope) as Prisma.LeaveRequestWhereInput],
      ...(q.status ? { status: q.status } : {}),
      ...(q.leaveTypeId ? { leaveTypeId: q.leaveTypeId } : {}),
      ...(q.employeeId ? { employeeId: q.employeeId } : {}),
      ...(q.departmentId ? { employee: { departmentId: q.departmentId } } : {}),
      ...(q.search
        ? {
            employee: {
              ...(q.departmentId ? { departmentId: q.departmentId } : {}),
              OR: [
                { firstName: { contains: q.search, mode: 'insensitive' } },
                { lastName: { contains: q.search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.leaveRequest.findMany({
        where,
        include: this.include(),
        orderBy: { appliedAt: q.order },
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serialize(r)), total, q.page, q.limit);
  }

  /**
   * Balances for a target employee, refusing callers outside their data scope:
   * an employee may only read their own, a department head their team's, and
   * admins/HR anyone's.
   */
  async balancesFor(user: AuthUser, employeeId: string) {
    const scope = await this.scope.resolve(user);
    if (scope.kind === 'self' && scope.employeeId !== employeeId) {
      throw new BadRequestException('You can only view your own leave balance');
    }
    if (scope.kind === 'team') {
      const inTeam = await this.prisma.employee.findFirst({
        where: { id: employeeId, departmentId: { in: scope.departmentIds } },
        select: { id: true },
      });
      if (!inTeam) throw new BadRequestException('This employee is not in your team');
    }
    return this.balances(user.organizationId, employeeId);
  }

  async createRequest(orgId: string, userId: string, dto: CreateLeaveRequestDto) {
    const employeeId = dto.employeeId ?? (await this.resolveEmployee(orgId, userId));

    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId: orgId, deletedAt: null },
      include: { manager: { select: { userId: true } } },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const leaveType = await this.prisma.leaveType.findFirst({ where: { id: dto.leaveTypeId, organizationId: orgId, deletedAt: null } });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const days = this.inclusiveDays(startDate, endDate);
    if (days < 1) throw new BadRequestException('endDate must be on or after startDate');

    // Allotted types (those with an accrual, e.g. Annual) may not be overdrawn:
    // already-taken plus still-pending days cannot exceed the allowance. Types
    // without an accrual (e.g. Sick) are additional and are not capped here.
    if (leaveType.accrualPerYear != null) {
      const balance = (await this.balances(orgId, employeeId))
        .find((b) => b.leaveTypeId === dto.leaveTypeId);
      const available = balance?.available ?? 0;
      if (days > available) {
        const pending = balance?.pending ?? 0;
        // Name the held-back days, otherwise the message contradicts the balance
        // the employee can see on screen.
        const held = pending > 0 ? ` (${pending} day(s) already awaiting approval)` : '';
        throw new BadRequestException(
          `Only ${available} day(s) of ${leaveType.name} leave can be requested${held}; this request is ${days} day(s).`);
      }
    }

    const request = await this.prisma.leaveRequest.create({
      data: {
        organizationId: orgId,
        employeeId,
        leaveTypeId: dto.leaveTypeId,
        startDate,
        endDate,
        days,
        reason: dto.reason,
        status: LeaveRequestStatus.pending,
        customFields: (dto.customFields ?? {}) as Prisma.InputJsonValue,
        createdById: userId,
        appliedAt: new Date(),
      },
      include: this.include(),
    });

    // Reserve the days against this year's balance (create the row if absent).
    await this.prisma.leaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId: dto.leaveTypeId, year: this.currentYear() } },
      create: { organizationId: orgId, employeeId, leaveTypeId: dto.leaveTypeId, year: this.currentYear(), pending: days },
      update: { pending: { increment: days } },
    });

    // Route to the employee's manager. If they have none — a department head
    // at the top of the chart — fall back to HR rather than creating an EMPTY
    // chain, which produced a request nobody was able to approve.
    let approverUserId = employee.manager?.userId ?? null;
    if (!approverUserId) {
      const hr = await this.prisma.employee.findFirst({
        where: {
          organizationId: orgId, deletedAt: null, id: { not: employee.id },
          user: { deletedAt: null, status: 'active', roles: { some: { role: { slug: 'hr-manager' } } } },
        },
        select: { userId: true },
        orderBy: { createdAt: 'asc' },
      });
      approverUserId = hr?.userId ?? null;
    }
    const chain = approverUserId ? [{ userId: approverUserId }] : [];
    await this.approvals.start(orgId, SUBJECT, request.id, chain);

    // Tell the approver there is something waiting. Best-effort: a notification
    // failure must never roll back a leave request the employee successfully
    // filed — they would see an error for work that actually succeeded.
    if (approverUserId) {
      const name = `${employee.firstName} ${employee.lastName}`;
      await this.notifications
        .notify(orgId, approverUserId, {}, {
          eventKey: 'leave.requested',
          category: 'leave',
          title: 'Leave request awaiting your approval',
          body: `${name} requested ${days} day(s) of ${leaveType.name} leave.`,
          data: { leaveRequestId: request.id },
        })
        .catch(() => undefined);
    }

    return this.serialize(request);
  }

  async approve(orgId: string, id: string, comment?: string) {
    return this.decide(orgId, id, 'approved', comment);
  }

  async reject(orgId: string, id: string, comment?: string) {
    return this.decide(orgId, id, 'rejected', comment);
  }

  async cancel(orgId: string, userId: string, id: string) {
    const request = await this.getPending(orgId, id);
    const employeeId = await this.resolveEmployee(orgId, userId);
    if (request.employeeId !== employeeId) throw new BadRequestException('You can only cancel your own leave request');

    await this.releasePending(request.organizationId, request.employeeId, request.leaveTypeId, request.days);
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveRequestStatus.cancelled, decidedAt: new Date() },
      include: this.include(),
    });
    return this.serialize(updated);
  }

  // --- helpers ---

  private async decide(orgId: string, id: string, decision: 'approved' | 'rejected', comment?: string) {
    const request = await this.getPending(orgId, id);

    // Drive the shared approval engine: act on the first pending step (if any).
    const steps = await this.approvals.state(SUBJECT, id);
    const pending = steps.find((s) => s.status === 'pending');
    if (pending) await this.approvals.act(SUBJECT, id, pending.id, decision, comment);

    if (decision === 'approved') {
      await this.moveToTaken(request.organizationId, request.employeeId, request.leaveTypeId, request.days);
    } else {
      await this.releasePending(request.organizationId, request.employeeId, request.leaveTypeId, request.days);
    }

    // Let the employee know the outcome — this is the half of the loop they
    // actually wait on.
    const applicant = await this.prisma.employee.findUnique({
      where: { id: request.employeeId },
      select: { userId: true, firstName: true },
    });
    if (applicant?.userId) {
      await this.notifications
        .notify(orgId, applicant.userId, {}, {
          eventKey: `leave.${decision}`,
          category: 'leave',
          title: decision === 'approved' ? 'Leave approved' : 'Leave rejected',
          body:
            decision === 'approved'
              ? `Your ${request.days} day(s) of leave was approved.`
              : `Your leave request was rejected${comment ? `: ${comment}` : '.'}`,
          data: { leaveRequestId: id },
        })
        .catch(() => undefined);
    }

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: decision === 'approved' ? LeaveRequestStatus.approved : LeaveRequestStatus.rejected,
        decidedAt: new Date(),
      },
      include: this.include(),
    });
    return this.serialize(updated);
  }

  private async getPending(orgId: string, id: string) {
    const request = await this.prisma.leaveRequest.findFirst({ where: { id, organizationId: orgId, deletedAt: null } });
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveRequestStatus.pending) throw new BadRequestException('Leave request is not pending');
    return request;
  }

  private async balanceRow(orgId: string, employeeId: string, leaveTypeId: string) {
    return this.prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year: this.currentYear() } },
    });
  }

  private async releasePending(orgId: string, employeeId: string, leaveTypeId: string, days: Prisma.Decimal | number) {
    const bal = await this.balanceRow(orgId, employeeId, leaveTypeId);
    if (!bal) return;
    const newPending = this.clampZero(bal.pending, days);
    await this.prisma.leaveBalance.update({ where: { id: bal.id }, data: { pending: newPending } });
  }

  private async moveToTaken(orgId: string, employeeId: string, leaveTypeId: string, days: Prisma.Decimal | number) {
    const bal = await this.balanceRow(orgId, employeeId, leaveTypeId);
    if (!bal) return;
    const newPending = this.clampZero(bal.pending, days);
    await this.prisma.leaveBalance.update({
      where: { id: bal.id },
      data: { pending: newPending, taken: { increment: days } },
    });
  }

  /** Subtract `days` from `current`, never dropping below zero. */
  private clampZero(current: Prisma.Decimal, days: Prisma.Decimal | number): Prisma.Decimal {
    const next = new Prisma.Decimal(current).minus(days);
    return next.isNegative() ? new Prisma.Decimal(0) : next;
  }

  private async resolveEmployee(orgId: string, userId: string): Promise<string> {
    const emp = await this.prisma.employee.findFirst({ where: { userId, organizationId: orgId, deletedAt: null } });
    if (!emp) throw new NotFoundException('No employee profile linked to the current user');
    return emp.id;
  }

  private inclusiveDays(start: Date, end: Date): number {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const a = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const b = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    return Math.floor((b - a) / MS_PER_DAY) + 1;
  }

  private currentYear(): number {
    return new Date().getFullYear();
  }

  private include() {
    return {
      employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } },
      leaveType: { select: { name: true } },
    };
  }

  private serialize(r: any) {
    return {
      id: r.id,
      employeeId: r.employeeId,
      employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : null,
      departmentName: r.employee?.department?.name ?? null,
      leaveTypeId: r.leaveTypeId,
      leaveType: r.leaveType?.name ?? null,
      startDate: r.startDate,
      endDate: r.endDate,
      // Prisma serializes Decimal as a string ("25"), which every client then
      // has to special-case. Days are at most a few hundred with one decimal
      // place, so a JS number carries them exactly — emit a real number.
      days: r.days == null ? null : Number(r.days),
      reason: r.reason,
      status: r.status,
      appliedAt: r.appliedAt,
    };
  }
}
