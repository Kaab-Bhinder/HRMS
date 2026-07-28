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
import { canSeePay } from '../../common/utils/pay-visibility.util';

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
    await this.storage.save(key, file.buffer, file.mimetype);
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

    // Trusted time: for mobile punches the SERVER clock is authoritative (a phone
    // clock can be changed to fake attendance). We keep the device's claimed time
    // only as evidence and flag a large skew for HR review.
    const isMobile = MOBILE_METHODS.includes(dto.method);
    const serverNow = new Date();
    const clientClaim = dto.occurredAt ? new Date(dto.occurredAt) : dto.clientCreatedAt ? new Date(dto.clientCreatedAt) : null;
    const occurredAt = isMobile ? serverNow : dto.occurredAt ? new Date(dto.occurredAt) : serverNow;
    const skewSeconds = clientClaim ? Math.round(Math.abs(serverNow.getTime() - clientClaim.getTime()) / 1000) : 0;

    const ctx: CaptureContext = { orgId, employeeId, type: dto.type, occurredAt, payload: dto, policy };
    const normalized = await provider.capture(ctx);

    // Attach anti-tamper markers (read by the day recompute to flag issues):
    // clock skew > 5 min, or a mocked/fake GPS location reported by the device.
    const markers: Record<string, unknown> = {};
    if (isMobile && skewSeconds > 300) {
      markers.timeSkew = { skewSeconds, clientTime: clientClaim?.toISOString(), serverTime: serverNow.toISOString() };
    }
    if (dto.isMocked === true || dto.metadata?.isMocked === true) {
      markers.mockLocation = true;
    }
    if (Object.keys(markers).length) {
      normalized.raw = { ...((normalized.raw as Record<string, unknown>) ?? {}), ...markers };
    }

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
    // Site names for "where they worked" — locationId is a bare column (no
    // relation), so resolve the page's distinct sites in one batch query.
    const siteIds = [...new Set(rows.map((r) => r.locationId).filter(Boolean))] as string[];
    const sites = siteIds.length
      ? await this.prisma.location.findMany({ where: { id: { in: siteIds } }, select: { id: true, name: true } })
      : [];
    const siteName = new Map(sites.map((s) => [s.id, s.name]));
    return paginated(rows.map((r) => this.serializeDay(r, siteName)), total, q.page, q.limit);
  }

  /**
   * Month scorecard: ONE row per in-scope employee with their day counts
   * (present/late/absent/on-leave/flagged) and worked hours. The org-wide
   * attendance page reads this; the per-day log lives on the employee's own
   * attendance page (the slip). Scoped exactly like listDays.
   */
  async employeeSummary(user: AuthUser, year: number, month: number, opts: { departmentId?: string; search?: string } = {}) {
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 0));

    const employees = await this.prisma.employee.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
        ...this.scope.employeeWhere(dataScope),
        ...(opts.departmentId ? { departmentId: opts.departmentId } : {}),
        ...(opts.search
          ? {
              OR: [
                { firstName: { contains: opts.search, mode: 'insensitive' } },
                { lastName: { contains: opts.search, mode: 'insensitive' } },
                { employeeCode: { contains: opts.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true, firstName: true, lastName: true, employeeCode: true,
        department: { select: { name: true } }, location: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    });
    const ids = employees.map((e) => e.id);
    if (ids.length === 0) return { year, month, rows: [] };

    const dayWhere = { organizationId: orgId, employeeId: { in: ids }, workDate: { gte: start, lte: end } };
    const [byStatus, flagged, worked] = await Promise.all([
      this.prisma.attendanceDay.groupBy({ by: ['employeeId', 'status'], where: dayWhere, _count: { _all: true } }),
      this.prisma.attendanceDay.groupBy({ by: ['employeeId'], where: { ...dayWhere, isFlagged: true }, _count: { _all: true } }),
      this.prisma.attendanceDay.groupBy({ by: ['employeeId'], where: dayWhere, _sum: { workedMinutes: true, lateMinutes: true } }),
    ]);

    const stat = new Map<string, Record<string, number>>();
    for (const r of byStatus) {
      const m = stat.get(r.employeeId) ?? {};
      m[r.status] = r._count._all;
      stat.set(r.employeeId, m);
    }
    const flaggedBy = new Map(flagged.map((r) => [r.employeeId, r._count._all]));
    const workedBy = new Map(worked.map((r) => [r.employeeId, r._sum]));

    return {
      year,
      month,
      rows: employees.map((e) => {
        const s = stat.get(e.id) ?? {};
        const presentDays = (s['present'] ?? 0) + (s['late'] ?? 0) + (s['half_day'] ?? 0);
        const w = workedBy.get(e.id);
        return {
          employeeId: e.id,
          employeeName: `${e.firstName} ${e.lastName}`,
          employeeCode: e.employeeCode,
          departmentName: e.department?.name ?? null,
          siteName: e.location?.name ?? null,
          presentDays,
          lateDays: s['late'] ?? 0,
          absentDays: s['absent'] ?? 0,
          onLeaveDays: s['on_leave'] ?? 0,
          flaggedDays: flaggedBy.get(e.id) ?? 0,
          workedHours: Math.round(((w?.workedMinutes ?? 0) / 60) * 10) / 10,
          lateMinutes: w?.lateMinutes ?? 0,
        };
      }),
    };
  }

  /**
   * Daily present/late/absent counts over a window, scoped to the caller and
   * optionally to one department — feeds the attendance page chart, which
   * follows the page's filters instead of always showing the whole org.
   */
  async trend(user: AuthUser, days = 14, departmentId?: string) {
    const window = Math.min(90, Math.max(7, days));
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    const end = new Date();
    end.setUTCHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (window - 1));

    const rows = await this.prisma.attendanceDay.groupBy({
      by: ['workDate', 'status'],
      where: {
        organizationId: orgId,
        workDate: { gte: start, lte: end },
        AND: [this.scope.byEmployee(dataScope), ...(departmentId ? [{ employee: { departmentId } }] : [])],
      },
      _count: { _all: true },
    });

    const mmdd = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    const byDate = new Map<string, { present: number; absent: number; late: number }>();
    for (let i = 0; i < window; i++) {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      byDate.set(mmdd(d), { present: 0, absent: 0, late: 0 });
    }
    for (const r of rows) {
      const bucket = byDate.get(mmdd(r.workDate));
      if (!bucket) continue;
      if (r.status === 'present') bucket.present += r._count._all;
      else if (r.status === 'absent') bucket.absent += r._count._all;
      else if (r.status === 'late') bucket.late += r._count._all;
    }
    return [...byDate.entries()].map(([date, v]) => ({ date, ...v }));
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

  /** Office coordinates + every currently checked-in employee's position, for
   *  the dashboard map. Scoped. Only active sessions (checked-in) are returned,
   *  so it scales — the frontend clusters the markers. Position is the latest
   *  live ping, falling back to the check-in location. */
  async mapData(user: AuthUser) {
    const orgId = user.organizationId;
    const dataScope = await this.scope.resolve(user);
    const [office, sessions] = await Promise.all([
      this.prisma.location.findFirst({
        where: { organizationId: orgId, deletedAt: null, latitude: { not: null }, longitude: { not: null } },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        select: { name: true, latitude: true, longitude: true, radiusMeters: true },
      }),
      this.prisma.attendanceSession.findMany({
        where: { organizationId: orgId, status: 'active', ...(this.scope.byEmployee(dataScope) as Prisma.AttendanceSessionWhereInput) },
        select: {
          employeeId: true, startedAt: true, startLat: true, startLng: true, lastPingAt: true,
          employee: { select: { firstName: true, lastName: true, employeeCode: true, department: { select: { name: true } } } },
          pings: { orderBy: { recordedAt: 'desc' }, take: 1, select: { latitude: true, longitude: true } },
        },
      }),
    ]);

    const employees = sessions
      .map((s) => {
        const p = s.pings[0];
        const lat = p ? Number(p.latitude) : s.startLat != null ? Number(s.startLat) : null;
        const lng = p ? Number(p.longitude) : s.startLng != null ? Number(s.startLng) : null;
        if (lat == null || lng == null) return null;
        return {
          id: s.employeeId,
          name: `${s.employee.firstName} ${s.employee.lastName}`,
          employeeCode: s.employee.employeeCode,
          departmentName: s.employee.department?.name ?? null,
          lat, lng,
          since: s.startedAt,
        };
      })
      .filter(Boolean);

    return {
      office: office?.latitude != null ? { name: office.name, lat: Number(office.latitude), lng: Number(office.longitude), radiusMeters: office.radiusMeters ?? 200 } : null,
      count: employees.length,
      employees,
    };
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
        // Pay rides on payroll:read, not attendance access (see pay-visibility.util).
        payPerHour: canSeePay(user) && emp.payPerHour ? Number(emp.payPerHour) : null,
      },
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      totals: { ...totals, workedHours: round2(totals.workedMinutes / 60) },
      days: days.map((d) => ({
        id: d.id,
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

  /** HR/admin review of a flagged attendance day: clears the flag and records
   *  who reviewed it + an optional note (human-in-the-loop resolution). */
  async resolveFlag(user: AuthUser, dayId: string, note?: string) {
    const day = await this.prisma.attendanceDay.findFirst({ where: { id: dayId, organizationId: user.organizationId } });
    if (!day) throw new NotFoundException('Attendance day not found');
    await this.assertCanSeeEmployee(user, day.employeeId);
    const reviewer = `${user.email ?? user.id}`;
    const stamped = `Reviewed by ${reviewer} on ${new Date().toISOString().slice(0, 10)}${note ? `: ${note}` : ''}`;
    await this.prisma.attendanceDay.update({
      where: { id: dayId },
      data: {
        isFlagged: false,
        isRegularized: true,
        note: day.note ? `${day.note}\n${stamped}` : stamped,
      },
    });
    return { success: true };
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
    return { enforceGeofence: p.enforceGeofence, allowRemote: p.allowRemote, allowedMethods: p.allowedMethods, trackingIntervalSec: p.trackingIntervalSec, checkInScope: p.checkInScope };
  }

  private serializeDay(r: any, siteName?: Map<string, string>) {
    return {
      id: r.id,
      employeeId: r.employeeId,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employeeCode: r.employee.employeeCode,
      departmentName: r.employee.department?.name ?? null,
      locationId: r.locationId ?? null,
      siteName: (r.locationId ? siteName?.get(r.locationId) : null) ?? null,
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
