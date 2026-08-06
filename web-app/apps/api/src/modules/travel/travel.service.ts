import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TravelApprover, TravelStatus, TravelVerification } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ApprovalService, ApproverRef } from '../approvals/approval.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ScopeService } from '../access/scope.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { paginated } from '../../common/dto/pagination.dto';
import {
  CreateTravelDto, QueryTravelDto, AdvanceDecisionDto, RealizationDto, VerifyDto, PaymentDto, RuleDto,
} from './dto/travel.dto';

const SUBJECT = 'travel_request';
const money = (v: unknown) => Number(v ?? 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Business travel, end to end: request → approval chain → advance →
 * accountability report → finance verification → settlement.
 *
 * Two rules run through the whole module:
 *  - Money is only ever moved by finance, never by the traveller.
 *  - Amounts are frozen at verification, so editing the report afterwards
 *    cannot silently change what was paid.
 */
@Injectable()
export class TravelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly approvals: ApprovalService,
    private readonly notifications: NotificationsService,
    private readonly scope: ScopeService,
  ) {}

  // ---------------------------------------------------------------- requests

  async create(user: AuthUser, dto: CreateTravelDto) {
    const orgId = user.organizationId;
    const employee = await this.resolveEmployee(user, dto.employeeId);

    if (new Date(dto.endDate) < new Date(dto.startDate)) {
      throw new BadRequestException('Return date cannot be before the departure date');
    }

    // Client name is denormalised so a later client rename doesn't rewrite
    // history on a trip that already happened.
    let clientName = dto.clientName ?? null;
    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: dto.clientId, organizationId: orgId, deletedAt: null },
        select: { name: true },
      });
      if (!client) throw new BadRequestException('Client not found');
      clientName = client.name;
    }

    return this.prisma.travelRequest.create({
      data: {
        organizationId: orgId,
        employeeId: employee.id,
        reference: await this.nextReference(orgId),
        destinationCity: dto.destinationCity,
        clientId: dto.clientId ?? null,
        clientName,
        purpose: dto.purpose,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        transportation: dto.transportation,
        hotelNeeded: dto.hotelNeeded ?? false,
        estimatedCost: dto.estimatedCost ?? 0,
        requestedTransport: dto.requestedTransport ?? 0,
        requestedHotel: dto.requestedHotel ?? 0,
        requestedAllowance: dto.requestedAllowance ?? 0,
        status: TravelStatus.draft,
        createdById: user.id,
      },
      include: this.include(),
    });
  }

  /** Submits for approval and builds the chain from the employee's level. */
  async submit(user: AuthUser, id: string) {
    const req = await this.mine(user, id);
    if (req.status !== TravelStatus.draft && req.status !== TravelStatus.rejected) {
      throw new BadRequestException(`A ${req.status} request cannot be submitted again`);
    }

    const chain = await this.buildChain(user.organizationId, req.employeeId);
    if (!chain.length) {
      throw new BadRequestException(
        'No approver could be resolved. Set the employee’s manager and department head, and add a Finance Officer.',
      );
    }
    await this.approvals.start(user.organizationId, SUBJECT, req.id, chain);
    const updated = await this.prisma.travelRequest.update({
      where: { id: req.id },
      data: { status: TravelStatus.submitted },
      include: this.include(),
    });
    await this.tellApprover(updated, chain[0], 'A travel request needs your approval');
    return updated;
  }

  /**
   * Resolves the approval chain for one employee: the first active rule whose
   * level range covers their designation decides which roles sign off, and
   * each role is resolved to a real person. Unresolvable steps are dropped
   * rather than blocking the request on a vacant post.
   */
  private async buildChain(orgId: string, employeeId: string): Promise<ApproverRef[]> {
    const emp = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId: orgId },
      select: {
        managerId: true,
        designation: { select: { level: true } },
        department: { select: { headEmployeeId: true } },
      },
    });
    if (!emp) throw new NotFoundException('Employee not found');

    const level = emp.designation?.level ?? 0;
    const rule = await this.prisma.travelApprovalRule.findFirst({
      where: { organizationId: orgId, isActive: true, minLevel: { lte: level }, maxLevel: { gte: level } },
      orderBy: { minLevel: 'desc' },
    });
    const steps = rule?.steps ?? [TravelApprover.supervisor, TravelApprover.department_head, TravelApprover.finance];

    const chain: ApproverRef[] = [];
    const seen = new Set<string>();
    for (const step of steps) {
      let ref: ApproverRef | null = null;
      if (step === TravelApprover.supervisor && emp.managerId) {
        ref = { employeeId: emp.managerId };
      } else if (step === TravelApprover.department_head && emp.department?.headEmployeeId) {
        ref = { employeeId: emp.department.headEmployeeId };
      } else if (step === TravelApprover.finance) {
        const finance = await this.prisma.user.findFirst({
          where: {
            organizationId: orgId, deletedAt: null, status: 'active',
            roles: { some: { role: { slug: 'finance-officer' } } },
          },
          select: { id: true },
        });
        if (finance) ref = { userId: finance.id };
      }
      // A person who is both supervisor and head shouldn't approve twice.
      const key = ref?.employeeId ?? ref?.userId;
      if (ref && key && !seen.has(key)) { seen.add(key); chain.push(ref); }
    }
    return chain;
  }

  /** Approve or reject the current step of the chain. */
  async decide(user: AuthUser, id: string, stepId: string, decision: 'approved' | 'rejected', comment?: string) {
    const req = await this.get(user, id);
    if (req.status !== TravelStatus.submitted) {
      throw new BadRequestException('This request is not awaiting approval');
    }
    const outcome = await this.approvals.act(SUBJECT, id, stepId, decision, comment);

    let status: TravelStatus = TravelStatus.submitted;
    if (outcome === 'rejected') status = TravelStatus.rejected;
    else if (outcome === 'approved') status = TravelStatus.approved;

    const updated = await this.prisma.travelRequest.update({
      where: { id }, data: { status }, include: this.include(),
    });

    if (status === TravelStatus.rejected) {
      await this.tellTraveller(updated, 'Your travel request was rejected');
    } else if (status === TravelStatus.approved) {
      await this.tellTraveller(updated, 'Your travel request was approved');
    } else {
      const steps = await this.approvals.state(SUBJECT, id);
      const next = steps.find((s) => s.status === 'pending');
      if (next) {
        await this.tellApprover(updated, { userId: next.approverUserId ?? undefined, employeeId: next.approverEmployeeId ?? undefined }, 'A travel request needs your approval');
      }
    }
    return updated;
  }

  // ---------------------------------------------------------------- advance

  /** Finance releases the advance, optionally adjusting each line down. */
  async decideAdvance(user: AuthUser, id: string, dto: AdvanceDecisionDto) {
    const req = await this.get(user, id);
    if (req.status !== TravelStatus.approved) {
      throw new BadRequestException('The request must be fully approved before an advance is released');
    }
    const updated = await this.prisma.travelRequest.update({
      where: { id },
      data: {
        approvedTransport: dto.transport ?? req.requestedTransport,
        approvedHotel: dto.hotel ?? req.requestedHotel,
        approvedAllowance: dto.allowance ?? req.requestedAllowance,
        advanceNote: dto.note,
      },
      include: this.include(),
    });
    await this.tellTraveller(updated, 'Your travel advance was approved');
    return updated;
  }

  /** Records the actual transfer of the advance. */
  async payAdvance(user: AuthUser, id: string, dto: PaymentDto) {
    const req = await this.get(user, id);
    if (req.status !== TravelStatus.approved) {
      throw new BadRequestException('Only an approved request can have its advance paid');
    }
    const updated = await this.prisma.travelRequest.update({
      where: { id },
      data: {
        status: TravelStatus.advance_paid,
        advancePaidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        advancePaymentRef: dto.reference,
      },
      include: this.include(),
    });
    await this.tellTraveller(updated, 'Your travel advance has been paid');
    return updated;
  }

  // ------------------------------------------------------------ realization

  /** The traveller files the accountability report. */
  async submitRealization(user: AuthUser, id: string, dto: RealizationDto) {
    const req = await this.mine(user, id);
    if (req.status !== TravelStatus.advance_paid && req.status !== TravelStatus.approved) {
      throw new BadRequestException('The report can only be filed after the request is approved');
    }
    if (dto.actualReturnDate && dto.actualDepartureDate && new Date(dto.actualReturnDate) < new Date(dto.actualDepartureDate)) {
      throw new BadRequestException('Actual return date cannot be before the actual departure date');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.travelRequest.update({
        where: { id },
        data: {
          actualDepartureDate: dto.actualDepartureDate ? new Date(dto.actualDepartureDate) : null,
          actualReturnDate: dto.actualReturnDate ? new Date(dto.actualReturnDate) : null,
          transportUsed: dto.transportUsed,
          hotelUsed: dto.hotelUsed,
          actualTransport: dto.actualTransport ?? 0,
          actualHotel: dto.actualHotel ?? 0,
          actualAllowance: dto.actualAllowance ?? 0,
          realizationNote: dto.note,
          status: TravelStatus.realization_submitted,
          realizationSubmittedAt: new Date(),
        },
      });
      // The log is replaced wholesale — it is one document, not an append log.
      await tx.travelActivity.deleteMany({ where: { travelRequestId: id } });
      if (dto.activities?.length) {
        await tx.travelActivity.createMany({
          data: dto.activities.map((a) => ({
            travelRequestId: id,
            activityDate: new Date(a.date),
            timeLabel: a.time,
            description: a.description,
          })),
        });
      }
    });

    const updated = await this.byId(id);
    await this.notifyFinance(updated, 'A travel accountability report is ready for verification');
    return updated;
  }

  /** Attaches an already-uploaded file as evidence. */
  async addEvidence(user: AuthUser, id: string, fileId: string, caption?: string) {
    await this.mine(user, id);
    const file = await this.prisma.fileObject.findFirst({
      where: { id: fileId, organizationId: user.organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!file) throw new BadRequestException('Uploaded file not found');
    await this.prisma.travelEvidence.create({ data: { travelRequestId: id, fileId, caption } });
    return this.byId(id);
  }

  async removeEvidence(user: AuthUser, id: string, evidenceId: string) {
    await this.mine(user, id);
    await this.prisma.travelEvidence.deleteMany({ where: { id: evidenceId, travelRequestId: id } });
    return this.byId(id);
  }

  // ----------------------------------------------------------- verification

  /**
   * Finance verifies the report and the settlement is computed and frozen:
   * positive means the company still owes the traveller, negative means
   * unspent advance must come back.
   */
  async verify(user: AuthUser, id: string, dto: VerifyDto) {
    const req = await this.get(user, id);
    if (req.status !== TravelStatus.realization_submitted) {
      throw new BadRequestException('Only a submitted report can be verified');
    }

    const claimed = round2(money(req.actualTransport) + money(req.actualHotel) + money(req.actualAllowance));
    // A partial approval must say how much is actually allowed; a full
    // approval defaults to the whole claim.
    const allowed =
      dto.result === TravelVerification.rejected ? 0
        : dto.verifiedAmount != null ? round2(dto.verifiedAmount)
          : claimed;
    if (dto.result === TravelVerification.partially_approved && dto.verifiedAmount == null) {
      throw new BadRequestException('A partial approval needs the verified amount');
    }
    if (allowed > claimed) {
      throw new BadRequestException('The verified amount cannot exceed what was claimed');
    }

    const advance = round2(money(req.approvedTransport) + money(req.approvedHotel) + money(req.approvedAllowance));
    const settlement = round2(allowed - advance);

    const updated = await this.prisma.travelRequest.update({
      where: { id },
      data: {
        verification: dto.result,
        verifiedAmount: allowed,
        verificationNote: dto.note,
        verifiedByUserId: user.id,
        verifiedAt: new Date(),
        settlementAmount: settlement,
        // Nothing left to move means the trip is closed on the spot.
        status: settlement === 0 ? TravelStatus.completed : TravelStatus.verified,
      },
      include: this.include(),
    });
    await this.tellTraveller(
      updated,
      dto.result === TravelVerification.rejected
        ? 'Your travel report was rejected'
        : settlement > 0 ? 'Your travel report was verified — a reimbursement is due'
          : settlement < 0 ? 'Your travel report was verified — unspent advance must be returned'
            : 'Your travel report was verified and settled',
    );
    return updated;
  }

  /** Records the settlement transfer (either direction) and closes the trip. */
  async paySettlement(user: AuthUser, id: string, dto: PaymentDto) {
    const req = await this.get(user, id);
    if (req.status !== TravelStatus.verified) {
      throw new BadRequestException('Only a verified report can be settled');
    }
    const updated = await this.prisma.travelRequest.update({
      where: { id },
      data: {
        settlementPaidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(),
        settlementPaymentRef: dto.reference,
        status: TravelStatus.completed,
      },
      include: this.include(),
    });
    await this.tellTraveller(updated, 'Your travel settlement is complete');
    return updated;
  }

  async cancel(user: AuthUser, id: string) {
    const req = await this.mine(user, id);
    if ([TravelStatus.completed, TravelStatus.advance_paid].includes(req.status as never)) {
      throw new BadRequestException('A trip with money already paid cannot be cancelled — verify the report instead');
    }
    return this.prisma.travelRequest.update({
      where: { id }, data: { status: TravelStatus.cancelled }, include: this.include(),
    });
  }

  // ------------------------------------------------------------------ reads

  async list(user: AuthUser, q: QueryTravelDto) {
    const where = await this.scopedWhere(user, q);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.travelRequest.findMany({
        where, include: this.include(), orderBy: { createdAt: 'desc' }, skip: q.skip, take: q.limit,
      }),
      this.prisma.travelRequest.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serialize(r)), total, q.page, q.limit);
  }

  async get(user: AuthUser, id: string) {
    const where = await this.scopedWhere(user, {} as QueryTravelDto);
    const req = await this.prisma.travelRequest.findFirst({ where: { ...where, id }, include: this.include() });
    if (!req) throw new NotFoundException('Travel request not found');
    return req;
  }

  async detail(user: AuthUser, id: string) {
    const req = await this.get(user, id);
    return { ...this.serialize(req), approvals: await this.approvals.state(SUBJECT, id) };
  }

  /** Dashboard tiles from the spec. */
  async stats(user: AuthUser) {
    const where = await this.scopedWhere(user, {} as QueryTravelDto);
    const [total, pendingApproval, pendingSettlement, cost] = await Promise.all([
      this.prisma.travelRequest.count({ where }),
      this.prisma.travelRequest.count({ where: { ...where, status: TravelStatus.submitted } }),
      this.prisma.travelRequest.count({ where: { ...where, status: TravelStatus.verified } }),
      this.prisma.travelRequest.aggregate({
        where: { ...where, status: { in: [TravelStatus.verified, TravelStatus.completed] } },
        _sum: { verifiedAmount: true },
      }),
    ]);
    return {
      totalTrips: total,
      totalCost: money(cost._sum.verifiedAmount),
      pendingApprovals: pendingApproval,
      pendingReimbursements: pendingSettlement,
    };
  }

  // ------------------------------------------------------- approval rules

  listRules(orgId: string) {
    return this.prisma.travelApprovalRule.findMany({
      where: { organizationId: orgId },
      orderBy: { minLevel: 'asc' },
    });
  }

  /** Rules are ranges over designation level; overlapping ranges are rejected
   *  so a request can never match two contradictory chains. */
  async upsertRule(orgId: string, dto: RuleDto, id?: string) {
    if (dto.minLevel > dto.maxLevel) {
      throw new BadRequestException('The minimum level cannot be above the maximum');
    }
    if (!dto.steps.length) throw new BadRequestException('A rule needs at least one approver step');

    const clash = await this.prisma.travelApprovalRule.findFirst({
      where: {
        organizationId: orgId, isActive: true,
        ...(id ? { id: { not: id } } : {}),
        minLevel: { lte: dto.maxLevel },
        maxLevel: { gte: dto.minLevel },
      },
      select: { name: true },
    });
    if (clash) throw new BadRequestException(`Level range overlaps the rule "${clash.name}"`);

    const data = {
      organizationId: orgId,
      name: dto.name,
      minLevel: dto.minLevel,
      maxLevel: dto.maxLevel,
      steps: dto.steps,
      isActive: dto.isActive ?? true,
    };
    return id
      ? this.prisma.travelApprovalRule.update({ where: { id }, data })
      : this.prisma.travelApprovalRule.create({ data });
  }

  async removeRule(orgId: string, id: string) {
    await this.prisma.travelApprovalRule.deleteMany({ where: { id, organizationId: orgId } });
    return { success: true };
  }

  /** Shows which chain an employee would actually get — so an admin can check
   *  a rule before a real request depends on it. */
  async previewChain(orgId: string, employeeId: string) {
    const chain = await this.buildChain(orgId, employeeId);
    const people = await Promise.all(
      chain.map(async (ref) => {
        if (ref.employeeId) {
          const e = await this.prisma.employee.findUnique({
            where: { id: ref.employeeId },
            select: { firstName: true, lastName: true, designation: { select: { title: true } } },
          });
          return e ? { name: `${e.firstName} ${e.lastName}`, role: e.designation?.title ?? 'Approver' } : null;
        }
        const u = await this.prisma.user.findUnique({ where: { id: ref.userId! }, select: { fullName: true } });
        return u ? { name: u.fullName, role: 'Finance' } : null;
      }),
    );
    return { steps: people.filter(Boolean) };
  }

  // -------------------------------------------------------------- internals

  /** Only the traveller (or an admin) may edit their own request. */
  private async mine(user: AuthUser, id: string) {
    const req = await this.get(user, id);
    const isAdmin = user.isSuperAdmin || user.permissions.includes('*') || user.permissions.includes('travel:manage');
    if (isAdmin) return req;
    const me = await this.prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!me || me.id !== req.employeeId) throw new ForbiddenException('This is not your travel request');
    return req;
  }

  private async resolveEmployee(user: AuthUser, employeeId?: string) {
    if (employeeId) {
      const emp = await this.prisma.employee.findFirst({
        where: { id: employeeId, organizationId: user.organizationId, deletedAt: null },
        select: { id: true },
      });
      if (!emp) throw new BadRequestException('Employee not found');
      return emp;
    }
    const me = await this.prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId, deletedAt: null },
      select: { id: true },
    });
    if (!me) throw new BadRequestException('No employee record is linked to your account');
    return me;
  }

  /**
   * Role scoping: admins see all, a head sees their team, everyone else sees
   * their own — PLUS anything routed to them for approval. Without that last
   * clause an approver cannot open the request they were asked to sign off,
   * which stalls the workflow at the first non-manager step.
   */
  private async scopedWhere(user: AuthUser, q: QueryTravelDto): Promise<Prisma.TravelRequestWhereInput> {
    const dataScope = await this.scope.resolve(user);
    const base: Prisma.TravelRequestWhereInput = {
      organizationId: user.organizationId,
      deletedAt: null,
      ...(q?.status ? { status: q.status } : {}),
      ...(q?.employeeId ? { employeeId: q.employeeId } : {}),
      ...(q?.clientId ? { clientId: q.clientId } : {}),
    };
    if (dataScope.kind === 'org') return base;

    const ownership: Prisma.TravelRequestWhereInput =
      dataScope.kind === 'team'
        ? { employee: this.scope.employeeWhere(dataScope) }
        : { employeeId: dataScope.employeeId };

    const assigned = await this.assignedToMe(user);
    return assigned.length ? { ...base, OR: [ownership, { id: { in: assigned } }] } : { ...base, ...ownership };
  }

  /** Ids of travel requests where this user appears anywhere in the chain. */
  private async assignedToMe(user: AuthUser): Promise<string[]> {
    const me = await this.prisma.employee.findFirst({
      where: { userId: user.id, organizationId: user.organizationId, deletedAt: null },
      select: { id: true },
    });
    const steps = await this.prisma.approvalStep.findMany({
      where: {
        organizationId: user.organizationId,
        subjectType: SUBJECT,
        OR: [{ approverUserId: user.id }, ...(me ? [{ approverEmployeeId: me.id }] : [])],
      },
      select: { subjectId: true },
    });
    return [...new Set(steps.map((s) => s.subjectId))];
  }

  private include() {
    return {
      employee: {
        select: {
          id: true, employeeCode: true, firstName: true, lastName: true,
          department: { select: { name: true } }, designation: { select: { title: true, level: true } },
        },
      },
      activities: { orderBy: [{ activityDate: 'asc' as const }, { timeLabel: 'asc' as const }] },
      evidence: true,
    };
  }

  private serialize(r: Record<string, any>) {
    const advance = round2(money(r.approvedTransport) + money(r.approvedHotel) + money(r.approvedAllowance));
    const requested = round2(money(r.requestedTransport) + money(r.requestedHotel) + money(r.requestedAllowance));
    const actual = round2(money(r.actualTransport) + money(r.actualHotel) + money(r.actualAllowance));
    return {
      ...r,
      employeeName: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '',
      departmentName: r.employee?.department?.name ?? '',
      requestedTotal: requested,
      advanceTotal: advance,
      actualTotal: actual,
      /** Days actually travelled, inclusive — "3 Days" in the spec. */
      durationDays:
        r.actualDepartureDate && r.actualReturnDate
          ? Math.round((new Date(r.actualReturnDate).getTime() - new Date(r.actualDepartureDate).getTime()) / 86_400_000) + 1
          : Math.round((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 86_400_000) + 1,
    };
  }

  private byId(id: string) {
    return this.prisma.travelRequest.findUniqueOrThrow({ where: { id }, include: this.include() }).then((r) => this.serialize(r));
  }

  /** Human-readable, per-organisation running number: TRV-2026-0001. */
  private async nextReference(orgId: string) {
    const year = new Date().getUTCFullYear();
    const count = await this.prisma.travelRequest.count({
      where: { organizationId: orgId, createdAt: { gte: new Date(Date.UTC(year, 0, 1)) } },
    });
    return `TRV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // Notifications are best-effort: a delivery failure must never roll back an
  // approval that already happened.
  private async tellTraveller(req: Record<string, any>, title: string) {
    const emp = await this.prisma.employee.findFirst({ where: { id: req.employeeId }, select: { userId: true } });
    if (emp?.userId) await this.safeNotify(req.organizationId, emp.userId, title, req);
  }

  private async tellApprover(req: Record<string, any>, ref: ApproverRef, title: string) {
    let userId = ref.userId;
    if (!userId && ref.employeeId) {
      const emp = await this.prisma.employee.findFirst({ where: { id: ref.employeeId }, select: { userId: true } });
      userId = emp?.userId ?? undefined;
    }
    if (userId) await this.safeNotify(req.organizationId, userId, title, req);
  }

  private async notifyFinance(req: Record<string, any>, title: string) {
    const finance = await this.prisma.user.findMany({
      where: {
        organizationId: req.organizationId, deletedAt: null, status: 'active',
        roles: { some: { role: { slug: 'finance-officer' } } },
      },
      select: { id: true },
    });
    for (const f of finance) await this.safeNotify(req.organizationId, f.id, title, req);
  }

  private async safeNotify(orgId: string, userId: string, title: string, req: Record<string, any>) {
    try {
      // Title and body belong in OPTIONS, not the interpolation context — the
      // renderer reads opts.title and falls back to a bare "Notification"
      // otherwise, which is what every travel alert used to say.
      await this.notifications.notify(
        orgId,
        userId,
        { reference: req.reference, destination: req.destinationCity, employeeName: req.employeeName ?? '' },
        {
          eventKey: 'travel.update',
          category: 'system',
          title,
          body: `${req.reference} · ${req.destinationCity}`,
          data: { travelRequestId: req.id },
        },
      );
    } catch {
      /* delivery is best-effort */
    }
  }
}
