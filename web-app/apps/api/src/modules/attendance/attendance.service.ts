import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceMethod, Prisma, PunchType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { paginated } from '../../common/dto/pagination.dto';
import { localDateParts, zonedWallToUtc } from '../../common/tz';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ApprovalService } from '../approvals/approval.service';
import { ScopeService } from '../access/scope.service';
import { StorageService } from '../files/storage.service';
import { TrackingService } from './tracking.service';
import { AttendanceRecomputeService } from './attendance-recompute.service';
import {
  ATTENDANCE_PROVIDER_REGISTRY, CaptureContext, EffectivePolicy, ProviderRegistry,
} from './providers/attendance-provider.interface';
import { ManualEntryDto, PunchDto, QueryAttendanceDto, RegularizationDto } from './dto/attendance.dto';

const MOBILE_METHODS: AttendanceMethod[] = ['mobile_gps', 'mobile_face'];

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ATTENDANCE_PROVIDER_REGISTRY) private readonly providers: ProviderRegistry,
    private readonly tracking: TrackingService,
    private readonly recompute: AttendanceRecomputeService,
    private readonly approvals: ApprovalService,
    private readonly scope: ScopeService,
    private readonly storage: StorageService,
  ) {}

  /** Stores a check-in selfie and returns its storage key. The mobile app then
   *  punches with method "mobile_face" + this key, which records a FaceCapture
   *  (auto-approved today; real match/liveness is a later engine swap). */
  async saveSelfie(user: AuthUser, file?: Express.Multer.File) {
    if (!file?.buffer) throw new BadRequestException('A selfie image is required');
    if (!file.mimetype?.startsWith('image/')) throw new BadRequestException('Selfie must be an image');
    const employeeId = await this.resolveEmployeeId(user.id);
    const key = this.storage.buildKey(user.organizationId, 'selfie', employeeId, file.originalname || 'selfie.jpg');
    await this.storage.save(key, file.buffer);
    return { storageKey: key };
  }

  /** Streams a stored face-capture image for audit — scoped to the caller. */
  async captureImage(user: AuthUser, captureId: string): Promise<{ bytes: Buffer; mime: string }> {
    const cap = await this.prisma.faceCapture.findFirst({ where: { id: captureId, organizationId: user.organizationId } });
    if (!cap) throw new NotFoundException('Capture not found');
    await this.assertCanSeeEmployee(user, cap.employeeId);
    return { bytes: await this.storage.read(cap.imageStorageKey), mime: 'image/jpeg' };
  }

  /** Unified punch entry point — routes to the right provider by method. */
  async punch(user: AuthUser, dto: PunchDto) {
    const orgId = user.organizationId;
    const employeeId = dto.employeeId ?? (await this.resolveEmployeeId(user.id));
    const policy = await this.effectivePolicy(orgId);

    if (policy && policy.allowedMethods.length && !policy.allowedMethods.includes(dto.method)) {
      throw new BadRequestException(`Attendance method "${dto.method}" is not allowed by policy`);
    }

    const provider = this.providers.get(dto.method);
    if (!provider) throw new BadRequestException(`No attendance provider registered for "${dto.method}"`);

    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();
    const ctx: CaptureContext = { orgId, employeeId, type: dto.type, occurredAt, payload: dto, policy };
    const normalized = await provider.capture(ctx);

    // Live tracking: open on mobile check-in, close on check-out.
    let sessionId: string | undefined;
    if (dto.type === PunchType.check_in && MOBILE_METHODS.includes(dto.method)) {
      const session = await this.tracking.openSession(orgId, employeeId, policy?.trackingIntervalSec ?? 120, normalized.latitude, normalized.longitude);
      sessionId = session.id;
    }

    const punch = await this.prisma.attendancePunch.create({
      data: {
        organizationId: orgId,
        employeeId,
        sessionId,
        type: normalized.type,
        method: normalized.method,
        occurredAt: normalized.occurredAt,
        locationId: normalized.locationId,
        latitude: normalized.latitude as any,
        longitude: normalized.longitude as any,
        accuracyMeters: normalized.accuracyMeters,
        faceCaptureId: normalized.faceCaptureId,
        deviceId: normalized.deviceId,
        isOffline: normalized.isOffline ?? false,
        clientCreatedAt: normalized.clientCreatedAt,
        rawPayload: normalized.raw as Prisma.InputJsonValue,
        createdById: user.id,
      },
    });

    if (dto.type === PunchType.check_out) {
      await this.tracking.closeActiveSession(employeeId, normalized.latitude, normalized.longitude);
    }

    const day = await this.recompute.recompute(orgId, employeeId, normalized.occurredAt);
    return { punch, day, sessionId, trackingIntervalSec: policy?.trackingIntervalSec ?? 120 };
  }

  /** Admin manual entry — creates in/out punches for a date and recomputes. */
  async manualEntry(user: AuthUser, dto: ManualEntryDto) {
    const orgId = user.organizationId;
    const workDate = new Date(dto.workDate);
    const rows: Prisma.AttendancePunchCreateManyInput[] = [];
    if (dto.checkInAt) rows.push(this.manualPunch(orgId, dto.employeeId, user.id, PunchType.check_in, new Date(dto.checkInAt)));
    if (dto.checkOutAt) rows.push(this.manualPunch(orgId, dto.employeeId, user.id, PunchType.check_out, new Date(dto.checkOutAt)));
    if (!rows.length) throw new BadRequestException('Provide checkInAt and/or checkOutAt');
    await this.prisma.attendancePunch.createMany({ data: rows });
    const day = await this.recompute.recompute(orgId, dto.employeeId, dto.checkInAt ? new Date(dto.checkInAt) : workDate);
    if (dto.note) await this.prisma.attendanceDay.update({ where: { id: day.id }, data: { note: dto.note } });
    return day;
  }

  async listDays(user: AuthUser, q: QueryAttendanceDto) {
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    // Scope + query filters are ANDed so a caller can never widen past their
    // scope (e.g. a self/team user passing someone else's employeeId).
    const where: Prisma.AttendanceDayWhereInput = {
      organizationId: orgId,
      AND: [
        this.scope.byEmployee(dataScope),
        {
          ...(q.employeeId ? { employeeId: q.employeeId } : {}),
          ...(q.status ? { status: q.status } : {}),
          ...(q.flagged != null ? { isFlagged: q.flagged } : {}),
          ...(q.date ? { workDate: new Date(q.date) } : {}),
          ...(q.departmentId ? { employee: { departmentId: q.departmentId } } : {}),
        },
      ],
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.attendanceDay.findMany({
        where,
        include: { employee: { select: { firstName: true, lastName: true, employeeCode: true, department: { select: { name: true } } } } },
        orderBy: [{ workDate: 'desc' }, { createdAt: 'desc' }],
        skip: q.skip,
        take: q.limit,
      }),
      this.prisma.attendanceDay.count({ where }),
    ]);
    return paginated(rows.map((r) => this.serializeDay(r)), total, q.page, q.limit);
  }

  async summary(user: AuthUser, dateStr?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    const dataScope = await this.scope.resolve(user);
    const scopeWhere = this.scope.byEmployee(dataScope);
    const where: Prisma.AttendanceDayWhereInput = { organizationId: user.organizationId, workDate: date, ...scopeWhere };
    const rows = await this.prisma.attendanceDay.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });
    const flagged = await this.prisma.attendanceDay.count({ where: { ...where, isFlagged: true } });
    const summary: Record<string, number> = { present: 0, late: 0, absent: 0, wfh: 0, on_leave: 0, half_day: 0, holiday: 0, weekly_off: 0, flagged };
    for (const r of rows) summary[r.status] = r._count._all;
    return summary;
  }

  /** Live map data, scoped: admins/HR see everyone; a head sees their team;
   *  a plain employee sees only themselves. */
  async live(user: AuthUser) {
    const dataScope = await this.scope.resolve(user);
    return this.tracking.liveSessions(user.organizationId, this.scope.byEmployee(dataScope) as Prisma.AttendanceSessionWhereInput);
  }

  /** Detailed per-employee attendance slip for a date range: every work day with
   *  in/out, worked/late/break minutes and flags, plus period totals. Scoped —
   *  the caller must be allowed to see the target employee. */
  async slip(user: AuthUser, employeeId: string, fromStr: string, toStr: string) {
    await this.assertCanSeeEmployee(user, employeeId);
    const from = startOfUtcDay(new Date(fromStr));
    const to = startOfUtcDay(new Date(toStr));
    const [emp, days] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: employeeId, organizationId: user.organizationId },
        select: { firstName: true, lastName: true, employeeCode: true, payPerHour: true, department: { select: { name: true } }, designation: { select: { title: true } } },
      }),
      this.prisma.attendanceDay.findMany({
        where: { organizationId: user.organizationId, employeeId, workDate: { gte: from, lte: to } },
        orderBy: { workDate: 'asc' },
      }),
    ]);
    if (!emp) throw new NotFoundException('Employee not found');

    // Check-in selfies (face captures) over the range, matched to each day by
    // proximity to the day's first check-in.
    const captures = await this.prisma.faceCapture.findMany({
      where: { organizationId: user.organizationId, employeeId, capturedAt: { gte: from, lt: new Date(to.getTime() + 86400000) } },
      select: { id: true, capturedAt: true },
      orderBy: { capturedAt: 'asc' },
    });
    const selfieForDay = (firstInAt: Date | null): string | null => {
      if (!firstInAt) return null;
      let best: { id: string; diff: number } | null = null;
      for (const cap of captures) {
        const diff = Math.abs(cap.capturedAt.getTime() - firstInAt.getTime());
        if (diff <= 3 * 3600 * 1000 && (!best || diff < best.diff)) best = { id: cap.id, diff };
      }
      return best?.id ?? null;
    };

    const totals = days.reduce(
      (t, d) => {
        t.workedMinutes += d.workedMinutes;
        t.lateMinutes += d.lateMinutes;
        t.breakMinutes += d.breakMinutes;
        t.overtimeMinutes += d.overtimeMinutes;
        if (d.status === 'present' || d.status === 'late' || d.status === 'half_day') t.present += 1;
        if (d.status === 'late') t.late += 1;
        if (d.status === 'absent') t.absent += 1;
        if (d.status === 'on_leave') t.onLeave += 1;
        if (d.isFlagged) t.flagged += 1;
        return t;
      },
      { workedMinutes: 0, lateMinutes: 0, breakMinutes: 0, overtimeMinutes: 0, present: 0, late: 0, absent: 0, onLeave: 0, flagged: 0 },
    );

    return {
      employee: {
        id: employeeId,
        name: `${emp.firstName} ${emp.lastName}`,
        employeeCode: emp.employeeCode,
        departmentName: emp.department?.name ?? null,
        designationName: emp.designation?.title ?? null,
        payPerHour: emp.payPerHour ? Number(emp.payPerHour) : null,
      },
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      totals: { ...totals, workedHours: round2(totals.workedMinutes / 60) },
      days: days.map((d) => ({
        workDate: d.workDate,
        status: d.status,
        firstInAt: d.firstInAt,
        lastOutAt: d.lastOutAt,
        workedMinutes: d.workedMinutes,
        lateMinutes: d.lateMinutes,
        breakMinutes: d.breakMinutes,
        overtimeMinutes: d.overtimeMinutes,
        isFlagged: d.isFlagged,
        flagReason: d.flagReason,
        selfieCaptureId: selfieForDay(d.firstInAt),
      })),
    };
  }

  /** Throws unless the caller's data scope includes the target employee. */
  async assertCanSeeEmployee(user: AuthUser, employeeId: string) {
    const dataScope = await this.scope.resolve(user);
    if (dataScope.kind === 'org') return;
    if (dataScope.kind === 'self') {
      if (dataScope.employeeId !== employeeId) throw new BadRequestException('You can only view your own records');
      return;
    }
    // team: the employee must be in one of the head's departments
    const emp = await this.prisma.employee.findFirst({ where: { id: employeeId, departmentId: { in: dataScope.departmentIds } }, select: { id: true } });
    if (!emp) throw new BadRequestException('This employee is not in your team');
  }

  // --- regularization (uses the generic approval engine) ---

  async requestRegularization(user: AuthUser, dto: RegularizationDto) {
    const orgId = user.organizationId;
    const employeeId = dto.employeeId ?? (await this.resolveEmployeeId(user.id));
    const reg = await this.prisma.attendanceRegularization.create({
      data: {
        organizationId: orgId,
        employeeId,
        workDate: new Date(dto.workDate),
        reason: dto.reason,
        requestedInAt: dto.requestedInAt ? new Date(dto.requestedInAt) : null,
        requestedOutAt: dto.requestedOutAt ? new Date(dto.requestedOutAt) : null,
      },
    });
    // route to the employee's manager (falls back to no chain = admin-actioned)
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId }, include: { manager: { select: { userId: true } } } });
    const approverUserId = emp?.manager?.userId ?? undefined;
    await this.approvals.start(orgId, 'attendance_regularization', reg.id, approverUserId ? [{ userId: approverUserId }] : []);
    return reg;
  }

  listRegularizations(orgId: string, status?: string) {
    return this.prisma.attendanceRegularization.findMany({
      where: { organizationId: orgId, ...(status ? { status: status as any } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async actRegularization(orgId: string, id: string, decision: 'approved' | 'rejected', reviewerId: string, comment?: string) {
    const reg = await this.prisma.attendanceRegularization.findFirst({ where: { id, organizationId: orgId } });
    if (!reg) throw new NotFoundException('Regularization not found');

    await this.prisma.attendanceRegularization.update({
      where: { id },
      data: { status: decision, reviewedById: reviewerId, reviewedAt: new Date() },
    });

    if (decision === 'approved') {
      // apply corrected times as manual punches, then recompute
      const rows: Prisma.AttendancePunchCreateManyInput[] = [];
      if (reg.requestedInAt) rows.push(this.manualPunch(orgId, reg.employeeId, reviewerId, PunchType.check_in, reg.requestedInAt));
      if (reg.requestedOutAt) rows.push(this.manualPunch(orgId, reg.employeeId, reviewerId, PunchType.check_out, reg.requestedOutAt));
      if (rows.length) await this.prisma.attendancePunch.createMany({ data: rows });
      const day = await this.recompute.recompute(orgId, reg.employeeId, reg.workDate);
      await this.prisma.attendanceDay.update({ where: { id: day.id }, data: { isRegularized: true } });
    }
    return { success: true, status: decision };
  }

  // --- helpers ---

  private manualPunch(orgId: string, employeeId: string, userId: string, type: PunchType, occurredAt: Date): Prisma.AttendancePunchCreateManyInput {
    return { organizationId: orgId, employeeId, type, method: AttendanceMethod.manual, occurredAt, createdById: userId };
  }

  async resolveEmployeeId(userId: string): Promise<string> {
    const emp = await this.prisma.employee.findFirst({ where: { userId, deletedAt: null }, select: { id: true } });
    if (!emp) throw new BadRequestException('No employee record linked to this user; pass employeeId explicitly');
    return emp.id;
  }

  /** Self-service: the signed-in employee's attendance status for today.
   *  Powers the mobile home screen (checked-in state + worked time). */
  async myToday(userId: string) {
    const emp = await this.prisma.employee.findFirst({ where: { userId, deletedAt: null }, select: { id: true, organizationId: true } });
    if (!emp) throw new BadRequestException('No employee record linked to this user');
    const employeeId = emp.id;
    const org = await this.prisma.organization.findUnique({ where: { id: emp.organizationId }, select: { timezone: true } });
    const tz = org?.timezone || 'UTC';
    const now = new Date();
    const { year, month, day: dom } = localDateParts(now, tz);
    const dayStart = zonedWallToUtc(year, month, dom, '00:00', tz); // instant of local midnight
    const workDate = new Date(Date.UTC(year, month, dom)); // @db.Date key

    const [day, lastPunch, active] = await Promise.all([
      this.prisma.attendanceDay.findUnique({ where: { employeeId_workDate: { employeeId, workDate } } }),
      this.prisma.attendancePunch.findFirst({
        where: { employeeId, occurredAt: { gte: dayStart } },
        orderBy: { occurredAt: 'desc' },
      }),
      this.tracking.getActive(employeeId),
    ]);

    const lastType = lastPunch?.type ?? null;
    return {
      date: workDate.toISOString().slice(0, 10),
      status: day?.status ?? 'absent',
      // "At work" = last punch is anything other than a check-out (a break
      // doesn't sign them out). On break specifically when it's break_start.
      isCheckedIn: lastType != null && lastType !== PunchType.check_out,
      isOnBreak: lastType === PunchType.break_start,
      firstInAt: day?.firstInAt ?? null,
      lastOutAt: day?.lastOutAt ?? null,
      workedMinutes: day?.workedMinutes ?? 0,
      breakMinutes: day?.breakMinutes ?? 0,
      overtimeMinutes: day?.overtimeMinutes ?? 0,
      lateMinutes: day?.lateMinutes ?? 0,
      lastPunchAt: lastPunch?.occurredAt ?? null,
      lastPunchType: lastType,
      lastPunchMethod: lastPunch?.method ?? null,
      activeSessionId: active?.id ?? null,
    };
  }

  private async effectivePolicy(orgId: string): Promise<EffectivePolicy | null> {
    const p = await this.prisma.attendancePolicy.findFirst({ where: { organizationId: orgId, isDefault: true, deletedAt: null } });
    if (!p) return null;
    return { enforceGeofence: p.enforceGeofence, allowRemote: p.allowRemote, allowedMethods: p.allowedMethods, trackingIntervalSec: p.trackingIntervalSec };
  }

  private serializeDay(r: any) {
    return {
      id: r.id,
      employeeId: r.employeeId,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employeeCode: r.employee.employeeCode,
      departmentName: r.employee.department?.name ?? null,
      workDate: r.workDate,
      firstInAt: r.firstInAt,
      lastOutAt: r.lastOutAt,
      status: r.status,
      workedMinutes: r.workedMinutes,
      overtimeMinutes: r.overtimeMinutes,
      lateMinutes: r.lateMinutes,
      earlyLeaveMinutes: r.earlyLeaveMinutes,
      isFlagged: r.isFlagged,
      flagReason: r.flagReason,
      isRegularized: r.isRegularized,
      primaryMethod: r.primaryMethod,
    };
  }
}

function startOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
