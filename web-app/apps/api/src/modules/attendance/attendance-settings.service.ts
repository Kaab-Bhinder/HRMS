import { BadRequestException, Injectable } from '@nestjs/common';
import { ShiftType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { isValidTimeZone } from '../../common/tz';

/**
 * One consolidated place for the super-admin to configure attendance:
 * office hours + break (default Shift), lateness/geofence/weekly-off (default
 * AttendancePolicy), the office location + geofence radius (default Location),
 * and the annual leave allowance (the "Annual Leave" LeaveType).
 *
 * Everything is find-or-create so the settings page always has a row to edit.
 */
@Injectable()
export class AttendanceSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(orgId: string) {
    const [shift, policy, office, leave, org] = await Promise.all([
      this.defaultShift(orgId),
      this.defaultPolicy(orgId),
      this.defaultOffice(orgId),
      this.annualLeave(orgId),
      this.prisma.organization.findUnique({ where: { id: orgId }, select: { timezone: true } }),
    ]);

    return {
      timezone: org?.timezone || 'UTC',
      officeHours: {
        startTime: shift.startTime,
        endTime: shift.endTime,
        graceMinutes: shift.graceMinutes,
        breakMinutes: shift.breakMinutes,
      },
      policy: {
        lateAfterMinutes: policy.lateAfterMinutes ?? 15,
        halfDayMinutes: policy.halfDayMinutes ?? 240,
        offSiteCheckIn: policy.offSiteCheckIn,
        checkInScope: policy.checkInScope,
        absentOnFaceMismatch: policy.absentOnFaceMismatch,
        weeklyOffDays: policy.weeklyOffDays,
        trackingIntervalSec: policy.trackingIntervalSec,
      },
      office: {
        id: office.id,
        name: office.name,
        address: office.address,
        latitude: office.latitude != null ? Number(office.latitude) : null,
        longitude: office.longitude != null ? Number(office.longitude) : null,
        radiusMeters: office.radiusMeters ?? 200,
      },
      leave: {
        annualLeaveDays: leave.accrualPerYear != null ? Number(leave.accrualPerYear) : 0,
      },
    };
  }

  async update(orgId: string, dto: AttendanceSettingsInput) {
    if (dto.timezone) {
      if (!isValidTimeZone(dto.timezone)) throw new BadRequestException(`"${dto.timezone}" is not a valid timezone`);
      await this.prisma.organization.update({ where: { id: orgId }, data: { timezone: dto.timezone } });
    }

    if (dto.officeHours) {
      const shift = await this.defaultShift(orgId);
      await this.prisma.shift.update({
        where: { id: shift.id },
        data: {
          startTime: dto.officeHours.startTime ?? shift.startTime,
          endTime: dto.officeHours.endTime ?? shift.endTime,
          graceMinutes: dto.officeHours.graceMinutes ?? shift.graceMinutes,
          breakMinutes: dto.officeHours.breakMinutes ?? shift.breakMinutes,
          workMinutes: workMinutes(dto.officeHours.startTime ?? shift.startTime, dto.officeHours.endTime ?? shift.endTime, dto.officeHours.breakMinutes ?? shift.breakMinutes),
        },
      });
    }

    if (dto.policy) {
      const policy = await this.defaultPolicy(orgId);
      await this.prisma.attendancePolicy.update({
        where: { id: policy.id },
        data: {
          lateAfterMinutes: dto.policy.lateAfterMinutes ?? policy.lateAfterMinutes,
          halfDayMinutes: dto.policy.halfDayMinutes ?? policy.halfDayMinutes,
          offSiteCheckIn: dto.policy.offSiteCheckIn ?? policy.offSiteCheckIn,
          checkInScope: dto.policy.checkInScope ?? policy.checkInScope,
          absentOnFaceMismatch: dto.policy.absentOnFaceMismatch ?? policy.absentOnFaceMismatch,
          weeklyOffDays: dto.policy.weeklyOffDays ?? policy.weeklyOffDays,
          trackingIntervalSec: dto.policy.trackingIntervalSec ?? policy.trackingIntervalSec,
        },
      });
    }

    if (dto.office) {
      const office = await this.defaultOffice(orgId);
      await this.prisma.location.update({
        where: { id: office.id },
        data: {
          name: dto.office.name ?? office.name,
          address: dto.office.address ?? office.address,
          latitude: dto.office.latitude ?? office.latitude,
          longitude: dto.office.longitude ?? office.longitude,
          radiusMeters: dto.office.radiusMeters ?? office.radiusMeters,
        },
      });
    }

    if (dto.leave?.annualLeaveDays != null) {
      const leave = await this.annualLeave(orgId);
      await this.prisma.leaveType.update({ where: { id: leave.id }, data: { accrualPerYear: dto.leave.annualLeaveDays } });
    }

    return this.get(orgId);
  }

  // --- per-site overrides -------------------------------------------------
  // A work site either INHERITS the defaults above or carries its own
  // location-tagged Shift (hours) + AttendancePolicy (rules). The attendance
  // engine already prefers location-tagged rows when scoring a day worked at
  // that site, so these methods are pure configuration CRUD.

  /** Every active site with its effective settings and whether they're custom. */
  async listSiteSettings(orgId: string) {
    const [sites, shifts, policies, defShift, defPolicy] = await Promise.all([
      this.prisma.location.findMany({
        where: { organizationId: orgId, deletedAt: null },
        orderBy: { name: 'asc' },
        include: { client: { select: { name: true } } },
      }),
      this.prisma.shift.findMany({ where: { organizationId: orgId, deletedAt: null, locationId: { not: null } } }),
      this.prisma.attendancePolicy.findMany({ where: { organizationId: orgId, deletedAt: null, locationId: { not: null } } }),
      this.defaultShift(orgId),
      this.defaultPolicy(orgId),
    ]);
    const shiftBy = new Map(shifts.map((s) => [s.locationId!, s]));
    const policyBy = new Map(policies.map((p) => [p.locationId!, p]));

    return sites.map((loc) => {
      const shift = shiftBy.get(loc.id);
      const policy = policyBy.get(loc.id);
      const effShift = shift ?? defShift;
      const effPolicy = policy ?? defPolicy;
      return {
        locationId: loc.id,
        name: loc.name,
        address: loc.address ?? null,
        clientName: loc.client?.name ?? null,
        isActive: loc.isActive,
        hasGeofence: loc.latitude != null && loc.longitude != null && !!loc.radiusMeters,
        radiusMeters: loc.radiusMeters ?? null,
        hasOverride: !!shift || !!policy,
        effective: {
          officeHours: {
            startTime: effShift.startTime,
            endTime: effShift.endTime,
            graceMinutes: effShift.graceMinutes,
            breakMinutes: effShift.breakMinutes,
          },
          policy: {
            lateAfterMinutes: effPolicy.lateAfterMinutes ?? 15,
            halfDayMinutes: effPolicy.halfDayMinutes ?? 240,
            offSiteCheckIn: effPolicy.offSiteCheckIn,
            absentOnFaceMismatch: effPolicy.absentOnFaceMismatch,
            weeklyOffDays: effPolicy.weeklyOffDays,
          },
        },
      };
    });
  }

  /** Create/update a site's own hours + rules (untick "use defaults"). */
  async upsertSiteSettings(orgId: string, locationId: string, dto: SiteSettingsInput) {
    const loc = await this.prisma.location.findFirst({ where: { id: locationId, organizationId: orgId, deletedAt: null } });
    if (!loc) throw new BadRequestException('Work site not found');

    if (dto.officeHours) {
      const existing = await this.prisma.shift.findFirst({ where: { organizationId: orgId, locationId, deletedAt: null } });
      const base = existing ?? (await this.defaultShift(orgId));
      const start = dto.officeHours.startTime ?? base.startTime;
      const end = dto.officeHours.endTime ?? base.endTime;
      const brk = dto.officeHours.breakMinutes ?? base.breakMinutes;
      const data = {
        startTime: start,
        endTime: end,
        graceMinutes: dto.officeHours.graceMinutes ?? base.graceMinutes,
        breakMinutes: brk,
        workMinutes: workMinutes(start, end, brk),
      };
      if (existing) await this.prisma.shift.update({ where: { id: existing.id }, data });
      else {
        await this.prisma.shift.create({
          data: { organizationId: orgId, locationId, name: `${loc.name} hours`, type: ShiftType.fixed, isDefault: false, ...data },
        });
      }
    }

    if (dto.policy) {
      const existing = await this.prisma.attendancePolicy.findFirst({ where: { organizationId: orgId, locationId, deletedAt: null } });
      const base = existing ?? (await this.defaultPolicy(orgId));
      const data = {
        lateAfterMinutes: dto.policy.lateAfterMinutes ?? base.lateAfterMinutes,
        halfDayMinutes: dto.policy.halfDayMinutes ?? base.halfDayMinutes,
        offSiteCheckIn: dto.policy.offSiteCheckIn ?? base.offSiteCheckIn,
        absentOnFaceMismatch: dto.policy.absentOnFaceMismatch ?? base.absentOnFaceMismatch,
        weeklyOffDays: dto.policy.weeklyOffDays ?? base.weeklyOffDays,
      };
      if (existing) await this.prisma.attendancePolicy.update({ where: { id: existing.id }, data });
      else {
        await this.prisma.attendancePolicy.create({
          data: {
            organizationId: orgId,
            locationId,
            name: `${loc.name} policy`,
            isDefault: false,
            graceMinutes: base.graceMinutes,
            trackingIntervalSec: base.trackingIntervalSec,
            checkInScope: base.checkInScope,
            ...data,
          },
        });
      }
    }

    return this.listSiteSettings(orgId);
  }

  /** Back to inheritance (re-tick "use defaults"): drop the site's own rows. */
  async removeSiteSettings(orgId: string, locationId: string) {
    const now = new Date();
    await this.prisma.shift.updateMany({ where: { organizationId: orgId, locationId, deletedAt: null }, data: { deletedAt: now } });
    await this.prisma.attendancePolicy.updateMany({ where: { organizationId: orgId, locationId, deletedAt: null }, data: { deletedAt: now } });
    return this.listSiteSettings(orgId);
  }

  // --- find-or-create defaults ---

  private async defaultShift(orgId: string) {
    const existing = await this.prisma.shift.findFirst({ where: { organizationId: orgId, deletedAt: null, locationId: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    if (existing) return existing;
    return this.prisma.shift.create({
      data: { organizationId: orgId, name: 'Office Hours', type: ShiftType.fixed, startTime: '09:00', endTime: '17:00', graceMinutes: 10, breakMinutes: 60, workMinutes: 420, isDefault: true },
    });
  }

  private async defaultPolicy(orgId: string) {
    const existing = await this.prisma.attendancePolicy.findFirst({ where: { organizationId: orgId, deletedAt: null, locationId: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    if (existing) return existing;
    return this.prisma.attendancePolicy.create({
      data: { organizationId: orgId, name: 'Default Policy', isDefault: true, graceMinutes: 10, lateAfterMinutes: 15, halfDayMinutes: 240, weeklyOffDays: [0, 6], trackingIntervalSec: 120 },
    });
  }

  private async defaultOffice(orgId: string) {
    const existing = await this.prisma.location.findFirst({ where: { organizationId: orgId, deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    if (existing) return existing;
    return this.prisma.location.create({
      data: { organizationId: orgId, name: 'Head Office', isActive: true, isDefault: true, radiusMeters: 200 },
    });
  }

  private async annualLeave(orgId: string) {
    const existing = await this.prisma.leaveType.findFirst({ where: { organizationId: orgId, code: 'ANNUAL', deletedAt: null } });
    if (existing) return existing;
    return this.prisma.leaveType.create({
      data: { organizationId: orgId, name: 'Annual Leave', code: 'ANNUAL', isPaid: true, accrualPerYear: 20 },
    });
  }
}

function workMinutes(start: string, end: string, breakMin: number): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return Math.max(0, mins - (breakMin ?? 0));
}

export interface SiteSettingsInput {
  officeHours?: { startTime?: string; endTime?: string; graceMinutes?: number; breakMinutes?: number };
  policy?: { lateAfterMinutes?: number; halfDayMinutes?: number; offSiteCheckIn?: 'allowed' | 'flag' | 'absent'; absentOnFaceMismatch?: boolean; weeklyOffDays?: number[] };
}

export interface AttendanceSettingsInput {
  timezone?: string;
  officeHours?: { startTime?: string; endTime?: string; graceMinutes?: number; breakMinutes?: number };
  policy?: { lateAfterMinutes?: number; halfDayMinutes?: number; offSiteCheckIn?: 'allowed' | 'flag' | 'absent'; checkInScope?: 'any_site' | 'assigned_only'; absentOnFaceMismatch?: boolean; weeklyOffDays?: number[]; trackingIntervalSec?: number };
  office?: { name?: string; address?: string; latitude?: number; longitude?: number; radiusMeters?: number };
  leave?: { annualLeaveDays?: number };
}
