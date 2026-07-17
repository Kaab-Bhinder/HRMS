import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AttendanceMethod, PunchType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { zonedWallToUtc } from '../../common/tz';
import { AttendanceRecomputeService } from './attendance-recompute.service';

const SWEEP_INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes
const LOOKBACK_DAYS = 3; // also close days left open on previous days

/**
 * Auto checkout. Anyone still checked in after their office day has closed is
 * automatically punched out at the office end-time — so nobody accrues time (or
 * keeps GPS running) by forgetting to check out. Pay is already capped at office
 * hours, so this can never create extra pay; it just keeps records honest.
 *
 * Runs on a self-managed interval (no external scheduler dependency) and once
 * shortly after boot. Idempotent: a day with a check-out is never touched again.
 */
@Injectable()
export class AttendanceAutoCheckoutService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('AutoCheckout');
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly recompute: AttendanceRecomputeService,
  ) {}

  onModuleInit() {
    // Kick off shortly after boot, then on a fixed interval.
    this.timer = setInterval(() => void this.sweep(), SWEEP_INTERVAL_MS);
    setTimeout(() => void this.sweep(), 10_000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  /** Closes every open attendance day whose office end-time has already passed. */
  async sweep(): Promise<{ closed: number }> {
    if (this.running) return { closed: 0 };
    this.running = true;
    try {
      const now = new Date();
      const from = startOfUtcDay(new Date(now.getTime() - LOOKBACK_DAYS * 86400000));

      // Open days = checked in (firstInAt set) but never checked out.
      const openDays = await this.prisma.attendanceDay.findMany({
        where: { workDate: { gte: from }, firstInAt: { not: null }, lastOutAt: null },
        select: { id: true, organizationId: true, employeeId: true, workDate: true, firstInAt: true },
      });
      if (!openDays.length) return { closed: 0 };

      // Cache each org's default shift end-time + timezone.
      const cfgByOrg = new Map<string, { endTime: string; isNight: boolean; startTime: string; tz: string } | null>();
      let closed = 0;

      for (const day of openDays) {
        let cfg = cfgByOrg.get(day.organizationId);
        if (cfg === undefined) {
          const [s, org] = await Promise.all([
            this.prisma.shift.findFirst({
              where: { organizationId: day.organizationId, deletedAt: null },
              orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
              select: { endTime: true, isNight: true, startTime: true },
            }),
            this.prisma.organization.findUnique({ where: { id: day.organizationId }, select: { timezone: true } }),
          ]);
          cfg = s ? { ...s, tz: org?.timezone || 'UTC' } : null;
          cfgByOrg.set(day.organizationId, cfg);
        }
        if (!cfg) continue;

        // The workDate key is UTC-midnight of the local calendar date, so its
        // UTC parts ARE the local date. Build the local office-close instant.
        const y = day.workDate.getUTCFullYear();
        const mo = day.workDate.getUTCMonth();
        const d = day.workDate.getUTCDate();
        const nightShift = cfg.isNight || cfg.endTime <= cfg.startTime;
        const shiftEnd = zonedWallToUtc(y, mo, nightShift ? d + 1 : d, cfg.endTime, cfg.tz);
        // Only close once the office day is actually over, and only if the
        // person checked in before the close (skip odd after-hours check-ins).
        if (now < shiftEnd) continue;
        if (day.firstInAt && day.firstInAt >= shiftEnd) continue;

        await this.prisma.attendancePunch.create({
          data: {
            organizationId: day.organizationId,
            employeeId: day.employeeId,
            type: PunchType.check_out,
            method: AttendanceMethod.manual,
            occurredAt: shiftEnd,
            rawPayload: { autoCheckout: true },
          },
        });
        // Stop any live-tracking session left open.
        await this.prisma.attendanceSession.updateMany({
          where: { employeeId: day.employeeId, status: 'active' },
          data: { status: 'ended', endedAt: shiftEnd },
        });
        const recomputed = await this.recompute.recompute(day.organizationId, day.employeeId, shiftEnd);
        await this.prisma.attendanceDay.update({ where: { id: recomputed.id }, data: { note: 'Auto checked-out at office close' } });
        closed += 1;
      }

      if (closed) this.logger.log(`Auto checked-out ${closed} open day(s).`);
      return { closed };
    } catch (e) {
      this.logger.error(`Sweep failed: ${(e as Error).message}`);
      return { closed: 0 };
    } finally {
      this.running = false;
    }
  }
}

function startOfUtcDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
