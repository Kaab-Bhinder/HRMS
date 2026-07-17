import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LeaveRequestStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ApprovalService } from '../approvals/approval.service';
import { ScopeService } from '../access/scope.service';
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

  async balances(orgId: string, employeeId: string) {
    const rows = await this.prisma.leaveBalance.findMany({
      where: { organizationId: orgId, employeeId, year: this.currentYear() },
      include: { leaveType: { select: { name: true } } },
      orderBy: { leaveType: { name: 'asc' } },
    });
    return rows.map((b) => ({
      id: b.id,
      employeeId: b.employeeId,
      leaveTypeId: b.leaveTypeId,
      leaveType: b.leaveType?.name ?? null,
      year: b.year,
      entitled: b.entitled,
      taken: b.taken,
      pending: b.pending,
      carriedForward: b.carriedForward,
    }));
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

    // Route to the employee's manager if one exists, otherwise no approval chain.
    const chain = employee.manager?.userId ? [{ userId: employee.manager.userId }] : [];
    await this.approvals.start(orgId, SUBJECT, request.id, chain);

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
      days: r.days,
      reason: r.reason,
      status: r.status,
      appliedAt: r.appliedAt,
    };
  }
}
