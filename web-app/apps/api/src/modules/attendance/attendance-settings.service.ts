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
        enforceGeofence: policy.enforceGeofence,
        allowRemote: policy.allowRemote,
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
          enforceGeofence: dto.policy.enforceGeofence ?? policy.enforceGeofence,
          allowRemote: dto.policy.allowRemote ?? policy.allowRemote,
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

  // --- find-or-create defaults ---

  private async defaultShift(orgId: string) {
    const existing = await this.prisma.shift.findFirst({ where: { organizationId: orgId, deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    if (existing) return existing;
    return this.prisma.shift.create({
      data: { organizationId: orgId, name: 'Office Hours', type: ShiftType.fixed, startTime: '09:00', endTime: '17:00', graceMinutes: 10, breakMinutes: 60, workMinutes: 420, isDefault: true },
    });
  }

  private async defaultPolicy(orgId: string) {
    const existing = await this.prisma.attendancePolicy.findFirst({ where: { organizationId: orgId, deletedAt: null }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
    if (existing) return existing;
    return this.prisma.attendancePolicy.create({
      data: { organizationId: orgId, name: 'Default Policy', isDefault: true, graceMinutes: 10, lateAfterMinutes: 15, halfDayMinutes: 240, enforceGeofence: true, allowRemote: false, weeklyOffDays: [0, 6], trackingIntervalSec: 120 },
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

export interface AttendanceSettingsInput {
  timezone?: string;
  officeHours?: { startTime?: string; endTime?: string; graceMinutes?: number; breakMinutes?: number };
  policy?: { lateAfterMinutes?: number; halfDayMinutes?: number; enforceGeofence?: boolean; allowRemote?: boolean; weeklyOffDays?: number[]; trackingIntervalSec?: number };
  office?: { name?: string; address?: string; latitude?: number; longitude?: number; radiusMeters?: number };
  leave?: { annualLeaveDays?: number };
}
