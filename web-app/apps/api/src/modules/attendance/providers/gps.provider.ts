import { BadRequestException, Injectable } from '@nestjs/common';
import { AttendanceMethod } from '@prisma/client';
import { AttendanceProvider, CaptureContext, NormalizedPunch } from './attendance-provider.interface';
import { SiteResolverService } from './site-resolver.service';

/**
 * GPS check-in with multi-site resolution (branches AND client premises) —
 * see SiteResolverService for the resolution rulebook. A punch outside the
 * radius is NOT blocked — it's recorded with a `geofence.outOfRange` marker
 * and the day recompute flags it for HR review (allow-but-flag: GPS is
 * imperfect; never lock a real worker out of clocking in).
 */
@Injectable()
export class GpsAttendanceProvider implements AttendanceProvider {
  readonly method = AttendanceMethod.mobile_gps;

  constructor(private readonly sites: SiteResolverService) {}

  async capture(ctx: CaptureContext): Promise<NormalizedPunch> {
    const { latitude, longitude } = ctx.payload;
    if (latitude == null || longitude == null) {
      throw new BadRequestException('GPS coordinates are required');
    }

    const { site, geofence } = await this.sites.resolve(ctx, latitude, longitude);

    return {
      type: ctx.type,
      method: this.method,
      occurredAt: ctx.occurredAt,
      locationId: site?.id,
      latitude,
      longitude,
      accuracyMeters: ctx.payload.accuracyMeters,
      isOffline: ctx.payload.isOffline ?? false,
      clientCreatedAt: ctx.payload.clientCreatedAt ? new Date(ctx.payload.clientCreatedAt) : undefined,
      raw: { ...(ctx.payload.metadata ?? {}), ...(geofence ? { geofence } : {}) },
    };
  }
}
