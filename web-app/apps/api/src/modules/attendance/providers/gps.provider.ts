import { BadRequestException, Injectable } from '@nestjs/common';
import { AttendanceMethod } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { haversineMeters } from '../../../common/geo';
import { AttendanceProvider, CaptureContext, NormalizedPunch } from './attendance-provider.interface';

/**
 * GPS check-in. The office location is resolved automatically (the org's active
 * geofenced Location) so the mobile app never has to know a locationId. A punch
 * outside the radius is NOT blocked — it's recorded with a `geofence.outOfRange`
 * marker in its payload, and the day recompute flags it (allow-but-flag policy).
 */
@Injectable()
export class GpsAttendanceProvider implements AttendanceProvider {
  readonly method = AttendanceMethod.mobile_gps;

  constructor(private readonly prisma: PrismaService) {}

  async capture(ctx: CaptureContext): Promise<NormalizedPunch> {
    const { latitude, longitude } = ctx.payload;
    if (latitude == null || longitude == null) {
      throw new BadRequestException('GPS coordinates are required');
    }

    // Resolve the office: caller-supplied location, else the org's default
    // geofenced office (an active Location with coordinates + radius).
    const loc = ctx.payload.locationId
      ? await this.prisma.location.findFirst({ where: { id: ctx.payload.locationId, organizationId: ctx.orgId, deletedAt: null } })
      : await this.prisma.location.findFirst({
          where: { organizationId: ctx.orgId, deletedAt: null, isActive: true, latitude: { not: null }, longitude: { not: null }, radiusMeters: { not: null } },
          orderBy: { createdAt: 'asc' },
        });

    let geofence: { locationId: string; locationName: string; distanceMeters: number; radiusMeters: number; outOfRange: boolean } | undefined;
    if (loc?.latitude != null && loc?.longitude != null && loc.radiusMeters) {
      const distance = Math.round(haversineMeters(latitude, longitude, Number(loc.latitude), Number(loc.longitude)));
      geofence = {
        locationId: loc.id,
        locationName: loc.name,
        distanceMeters: distance,
        radiusMeters: loc.radiusMeters,
        // Remote-allowed policies never count as out of range.
        outOfRange: !(ctx.policy?.allowRemote ?? false) && distance > loc.radiusMeters,
      };
    }

    return {
      type: ctx.type,
      method: this.method,
      occurredAt: ctx.occurredAt,
      locationId: loc?.id,
      latitude,
      longitude,
      accuracyMeters: ctx.payload.accuracyMeters,
      isOffline: ctx.payload.isOffline ?? false,
      clientCreatedAt: ctx.payload.clientCreatedAt ? new Date(ctx.payload.clientCreatedAt) : undefined,
      raw: { ...(ctx.payload.metadata ?? {}), ...(geofence ? { geofence } : {}) },
    };
  }
}
