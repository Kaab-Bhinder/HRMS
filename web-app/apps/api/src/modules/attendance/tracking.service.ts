import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

interface PingPoint {
  recordedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speed?: number;
  battery?: number;
  isMoving?: boolean;
}

/**
 * Live location tracking. A session opens on mobile check-in and closes on
 * check-out; the app streams batched pings in between (battery-efficient).
 * Reading anyone's location requires `attendance:track` (enforced at the
 * controller); an employee may only write to their own active session.
 */
@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async openSession(orgId: string, employeeId: string, intervalSec: number, startLat?: number, startLng?: number) {
    // close any stale active session first
    await this.prisma.attendanceSession.updateMany({
      where: { employeeId, status: 'active' },
      data: { status: 'expired', endedAt: new Date() },
    });
    return this.prisma.attendanceSession.create({
      data: {
        organizationId: orgId,
        employeeId,
        status: 'active',
        updateIntervalSec: intervalSec,
        startLat: startLat as any,
        startLng: startLng as any,
        workDate: startOfDay(new Date()),
      },
    });
  }

  async closeActiveSession(employeeId: string, endLat?: number, endLng?: number) {
    const active = await this.prisma.attendanceSession.findFirst({ where: { employeeId, status: 'active' } });
    if (!active) return null;
    return this.prisma.attendanceSession.update({
      where: { id: active.id },
      data: { status: 'ended', endedAt: new Date(), endLat: endLat as any, endLng: endLng as any },
    });
  }

  async getActive(employeeId: string) {
    return this.prisma.attendanceSession.findFirst({ where: { employeeId, status: 'active' } });
  }

  /** Employee streams batched pings for their own active session. */
  async ping(employeeId: string, sessionId: string, points: PingPoint[]) {
    const session = await this.prisma.attendanceSession.findUnique({ where: { id: sessionId } });
    if (!session || session.employeeId !== employeeId) throw new ForbiddenException('Not your session');
    if (session.status !== 'active') throw new ForbiddenException('Session is not active');
    if (!points.length) return { accepted: 0 };

    await this.prisma.locationPing.createMany({
      data: points.map((p) => ({
        sessionId,
        employeeId,
        recordedAt: new Date(p.recordedAt),
        latitude: p.latitude as any,
        longitude: p.longitude as any,
        accuracyMeters: p.accuracyMeters,
        speed: p.speed as any,
        battery: p.battery,
        isMoving: p.isMoving,
      })),
    });
    const last = points[points.length - 1];
    await this.prisma.attendanceSession.update({ where: { id: sessionId }, data: { lastPingAt: new Date(last.recordedAt) } });
    return { accepted: points.length };
  }

  // --- admin-only reads (guarded by attendance:track at the controller) ---

  /** All currently-active sessions with their latest known position (live map).
   *  `scopeWhere` narrows to a dept head's team / an employee's own session. */
  async liveSessions(orgId: string, scopeWhere: Prisma.AttendanceSessionWhereInput = {}) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { organizationId: orgId, status: 'active', ...scopeWhere },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        pings: { orderBy: { recordedAt: 'desc' }, take: 1 },
      },
    });
    return sessions.map((s) => ({
      sessionId: s.id,
      employeeId: s.employeeId,
      employeeName: `${s.employee.firstName} ${s.employee.lastName}`,
      employeeCode: s.employee.employeeCode,
      startedAt: s.startedAt,
      lastPingAt: s.lastPingAt,
      last: s.pings[0] ? { lat: Number(s.pings[0].latitude), lng: Number(s.pings[0].longitude), at: s.pings[0].recordedAt, battery: s.pings[0].battery } : null,
    }));
  }

  /** Full ordered route for a session — powers playback whenever we enable it. */
  async route(orgId: string, sessionId: string) {
    const session = await this.prisma.attendanceSession.findFirst({ where: { id: sessionId, organizationId: orgId } });
    if (!session) throw new NotFoundException('Session not found');
    const pings = await this.prisma.locationPing.findMany({
      where: { sessionId },
      orderBy: { recordedAt: 'asc' },
      select: { latitude: true, longitude: true, recordedAt: true, speed: true, battery: true, accuracyMeters: true },
    });
    return {
      sessionId,
      employeeId: session.employeeId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      points: pings.map((p) => ({ lat: Number(p.latitude), lng: Number(p.longitude), at: p.recordedAt, speed: p.speed ? Number(p.speed) : null, battery: p.battery })),
    };
  }
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
