import { Injectable } from '@nestjs/common';
import { AttendanceDayStatus, AttendanceMethod } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { localDateParts, localDow, zonedWallToUtc } from '../../common/tz';

/**
 * Recomputes an employee's AttendanceDay summary from raw punches + shift +
 * policy + holidays + leave. Idempotent — safe to call after any new punch,
 * biometric sync, or approved regularization.
 *
 * Work-day boundaries and shift start/end are interpreted in the organization's
 * timezone (Organization.timezone), so "9:00" and "late" mean local time.
 */
@Injectable()
export class AttendanceRecomputeService {
  constructor(private readonly prisma: PrismaService) {}

  async recompute(orgId: string, employeeId: string, workDate: Date) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId }, select: { timezone: true } });
    const tz = org?.timezone || 'UTC';

    // The local calendar day containing `workDate`, and its UTC boundaries.
    const { year, month, day } = localDateParts(workDate, tz);
    const dayStart = zonedWallToUtc(year, month, day, '00:00', tz); // instant of local midnight
    const dayEnd = zonedWallToUtc(year, month, day + 1, '00:00', tz); // next local midnight
    const dateKey = new Date(Date.UTC(year, month, day)); // @db.Date key = local calendar date

    const [punches, empShift, policy, holiday, leave] = await Promise.all([
      this.prisma.attendancePunch.findMany({
        where: { employeeId, occurredAt: { gte: dayStart, lt: dayEnd } },
        orderBy: { occurredAt: 'asc' },
      }),
      this.prisma.employeeShift.findFirst({
        where: { employeeId, effectiveFrom: { lte: dayStart }, OR: [{ effectiveTo: null }, { effectiveTo: { gte: dayStart } }] },
        orderBy: { effectiveFrom: 'desc' },
        include: { shift: true },
      }),
      this.prisma.attendancePolicy.findFirst({ where: { organizationId: orgId, isDefault: true, deletedAt: null } }),
      this.prisma.holiday.findFirst({ where: { organizationId: orgId, date: dateKey } }),
      this.prisma.leaveRequest.findFirst({
        where: { employeeId, status: 'approved', startDate: { lte: dateKey }, endDate: { gte: dateKey }, deletedAt: null },
      }),
    ]);

    // Fall back to the org's default shift so office hours (late/break) apply to
    // everyone, even employees without an explicit shift assignment.
    const shift = empShift?.shift ?? (await this.prisma.shift.findFirst({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    }));
    const weeklyOff = (policy?.weeklyOffDays ?? [0, 6]).includes(localDow(dayStart, tz));

    // No punches → derive a non-working status.
    if (punches.length === 0) {
      const status: AttendanceDayStatus = holiday
        ? 'holiday'
        : leave
          ? 'on_leave'
          : weeklyOff
            ? 'weekly_off'
            : 'absent';
      return this.upsert(orgId, employeeId, dateKey, { status, shiftId: shift?.id, policyId: policy?.id });
    }

    const firstIn = punches.find((p) => p.type === 'check_in')?.occurredAt ?? punches[0].occurredAt;
    const lastOut = [...punches].reverse().find((p) => p.type === 'check_out')?.occurredAt ?? null;

    // break minutes from break_start/break_end pairs
    let breakMinutes = 0;
    let openBreak: Date | null = null;
    for (const p of punches) {
      if (p.type === 'break_start') openBreak = p.occurredAt;
      else if (p.type === 'break_end' && openBreak) {
        breakMinutes += minutesBetween(openBreak, p.occurredAt);
        openBreak = null;
      }
    }

    const grossMinutes = lastOut ? minutesBetween(firstIn, lastOut) : 0;
    const workedMinutes = Math.max(0, grossMinutes - breakMinutes);

    let lateMinutes = 0;
    let earlyLeaveMinutes = 0;
    if (shift) {
      const shiftStart = zonedWallToUtc(year, month, day, shift.startTime, tz);
      const nightShift = shift.isNight || shift.endTime <= shift.startTime;
      const shiftEnd = nightShift
        ? zonedWallToUtc(year, month, day + 1, shift.endTime, tz)
        : zonedWallToUtc(year, month, day, shift.endTime, tz);
      const grace = shift.graceMinutes ?? 0;
      lateMinutes = Math.max(0, minutesBetween(new Date(shiftStart.getTime() + grace * 60000), firstIn));
      if (lastOut) {
        earlyLeaveMinutes = Math.max(0, minutesBetween(lastOut, shiftEnd));
      }
    }

    const otThreshold = policy?.overtimeAfterMinutes ?? shift?.workMinutes ?? 480;
    const overtimeMinutes = Math.max(0, workedMinutes - otThreshold);
    const halfDay = policy?.halfDayMinutes ?? 240;
    const lateAfter = policy?.lateAfterMinutes ?? 15;

    let status: AttendanceDayStatus = 'present';
    if (lastOut && workedMinutes > 0 && workedMinutes < halfDay) status = 'half_day';
    else if (lateMinutes > lateAfter) status = 'late';

    const primaryMethod = mode(punches.map((p) => p.method)) as AttendanceMethod;

    // Flags surfaced to admins: a check-in outside the office geofence, or a
    // break longer than the shift allowance.
    const allowedBreak = shift?.breakMinutes ?? 0;
    const outOfGeofence = punches.some((p) => (p.rawPayload as any)?.geofence?.outOfRange === true);
    const breakOver = allowedBreak > 0 && breakMinutes > allowedBreak;
    const reasons: string[] = [];
    if (outOfGeofence) {
      const g = punches.map((p) => (p.rawPayload as any)?.geofence).find((x) => x?.outOfRange);
      reasons.push(`Checked in ${g?.distanceMeters ?? '?'}m from ${g?.locationName ?? 'office'} (limit ${g?.radiusMeters ?? '?'}m)`);
    }
    if (breakOver) reasons.push(`Break ${breakMinutes}m exceeds allowed ${allowedBreak}m`);

    return this.upsert(orgId, employeeId, dateKey, {
      status,
      shiftId: shift?.id,
      policyId: policy?.id,
      firstInAt: firstIn,
      lastOutAt: lastOut,
      workedMinutes,
      breakMinutes,
      overtimeMinutes,
      lateMinutes,
      earlyLeaveMinutes,
      primaryMethod,
      isFlagged: reasons.length > 0,
      flagReason: reasons.length ? reasons.join('; ') : null,
    });
  }

  private upsert(orgId: string, employeeId: string, workDate: Date, data: Record<string, unknown>) {
    return this.prisma.attendanceDay.upsert({
      where: { employeeId_workDate: { employeeId, workDate } },
      create: { organizationId: orgId, employeeId, workDate, ...data } as any,
      update: data as any,
    });
  }
}

function minutesBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}
function mode<T>(arr: T[]): T | undefined {
  const counts = new Map<T, number>();
  let best: T | undefined;
  let bestN = 0;
  for (const v of arr) {
    const n = (counts.get(v) ?? 0) + 1;
    counts.set(v, n);
    if (n > bestN) {
      bestN = n;
      best = v;
    }
  }
  return best;
}
