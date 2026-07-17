import { BadRequestException, Injectable } from '@nestjs/common';
import { AttendanceMethod } from '@prisma/client';
import { AttendanceProvider, CaptureContext, NormalizedPunch } from './attendance-provider.interface';

function base(ctx: CaptureContext, method: AttendanceMethod): NormalizedPunch {
  const p = ctx.payload;
  return {
    type: ctx.type,
    method,
    occurredAt: ctx.occurredAt,
    locationId: p.locationId,
    latitude: p.latitude,
    longitude: p.longitude,
    accuracyMeters: p.accuracyMeters,
    deviceId: p.deviceId,
    isOffline: p.isOffline ?? false,
    clientCreatedAt: p.clientCreatedAt ? new Date(p.clientCreatedAt) : undefined,
    raw: p.metadata,
  };
}

/** Admin manual entry — trusted, no device validation. */
@Injectable()
export class ManualAttendanceProvider implements AttendanceProvider {
  readonly method = AttendanceMethod.manual;
  async capture(ctx: CaptureContext): Promise<NormalizedPunch> {
    return base(ctx, this.method);
  }
}

/** Web check-in from the admin/portal — no geofence. */
@Injectable()
export class WebAttendanceProvider implements AttendanceProvider {
  readonly method = AttendanceMethod.web;
  async capture(ctx: CaptureContext): Promise<NormalizedPunch> {
    return base(ctx, this.method);
  }
}

/** QR-code check-in. The QR encodes a location id (a real impl verifies a signed, rotating token). */
@Injectable()
export class QrAttendanceProvider implements AttendanceProvider {
  readonly method = AttendanceMethod.qr;
  async capture(ctx: CaptureContext): Promise<NormalizedPunch> {
    const token = ctx.payload.qrToken;
    if (!token) throw new BadRequestException('QR token is required');
    return { ...base(ctx, this.method), locationId: ctx.payload.locationId ?? token };
  }
}
