import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { haversineMeters } from '../../../common/geo';
import { CaptureContext } from './attendance-provider.interface';

export interface ResolvedGeofence {
  locationId: string;
  locationName: string;
  distanceMeters: number;
  radiusMeters: number;
  outOfRange: boolean;
}

type SiteRow = { id: string; name: string; latitude: unknown; longitude: unknown; radiusMeters: number | null };

/**
 * Shared work-site resolution for every location-aware punch method (GPS and
 * face — one rulebook, not one per method). Work sites are the org's active
 * geofenced Locations: its own branches AND client premises (Location.clientId),
 * so outsourced staff clock in at the client exactly like branch staff at a
 * branch. The employee never picks a site — GPS resolves it.
 *
 * Resolution order:
 *  1. Caller-supplied locationId (kiosk/biometric devices bound to a site).
 *  2. Policy `assigned_only` + employee has an assigned usable site → that
 *     site ONLY; being inside a different branch still counts as out of range.
 *  3. Otherwise (any_site, or unassigned employee): the NEAREST site wins, so
 *     a fresh rollout never flags an unassigned workforce.
 */
@Injectable()
export class SiteResolverService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(ctx: CaptureContext, lat: number, lng: number): Promise<{ site: SiteRow | null; geofence?: ResolvedGeofence }> {
    const site = await this.pickSite(ctx, lat, lng);
    if (!site || site.latitude == null || site.longitude == null || !site.radiusMeters) {
      return { site };
    }
    const distance = Math.round(haversineMeters(lat, lng, Number(site.latitude), Number(site.longitude)));
    return {
      site,
      geofence: {
        locationId: site.id,
        locationName: site.name,
        distanceMeters: distance,
        radiusMeters: site.radiusMeters,
        // Remote-allowed policies never count as out of range.
        outOfRange: !(ctx.policy?.allowRemote ?? false) && distance > site.radiusMeters,
      },
    };
  }

  private async pickSite(ctx: CaptureContext, lat: number, lng: number): Promise<SiteRow | null> {
    // 1. Device-bound site.
    if (ctx.payload.locationId) {
      return this.prisma.location.findFirst({
        where: { id: ctx.payload.locationId, organizationId: ctx.orgId, deletedAt: null },
        select: { id: true, name: true, latitude: true, longitude: true, radiusMeters: true },
      });
    }

    // 2. Strict mode: an employee WITH an assigned site answers to it alone.
    if (ctx.policy?.checkInScope === 'assigned_only') {
      const emp = await this.prisma.employee.findFirst({
        where: { id: ctx.employeeId, organizationId: ctx.orgId },
        select: { location: { select: { id: true, name: true, latitude: true, longitude: true, radiusMeters: true, isActive: true, deletedAt: true } } },
      });
      const a = emp?.location;
      if (a && !a.deletedAt && a.isActive && a.latitude != null && a.longitude != null && a.radiusMeters) {
        return a;
      }
      // Unassigned (or site unusable) falls through to nearest-site.
    }

    // 3. Nearest active geofenced site — branch or client premises alike.
    const sites = await this.prisma.location.findMany({
      where: { organizationId: ctx.orgId, deletedAt: null, isActive: true, latitude: { not: null }, longitude: { not: null }, radiusMeters: { not: null } },
      select: { id: true, name: true, latitude: true, longitude: true, radiusMeters: true },
    });
    if (sites.length === 0) return null;
    let best = sites[0];
    let bestDist = Infinity;
    for (const s of sites) {
      const d = haversineMeters(lat, lng, Number(s.latitude), Number(s.longitude));
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    }
    return best;
  }
}
