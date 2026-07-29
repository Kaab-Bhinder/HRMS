import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';
import { CheckInScope, OffSitePolicy } from '@prisma/client';

class OfficeHoursDto {
  @ApiPropertyOptional({ example: '09:00' }) @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) startTime?: string;
  @ApiPropertyOptional({ example: '17:00' }) @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) endTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(180) graceMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(480) breakMinutes?: number;
}

class PolicyDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(240) lateAfterMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(720) halfDayMinutes?: number;
  @ApiPropertyOptional({ enum: OffSitePolicy, description: 'Off-site check-in: allowed | flag (default) | absent' })
  @IsOptional() @IsEnum(OffSitePolicy) offSiteCheckIn?: OffSitePolicy;
  @ApiPropertyOptional({ description: 'Face mismatch marks the day ABSENT (default: flag only)' })
  @IsOptional() @IsBoolean() absentOnFaceMismatch?: boolean;
  @ApiPropertyOptional({ description: '0=Sun … 6=Sat' }) @IsOptional() @IsArray() @IsInt({ each: true }) weeklyOffDays?: number[];
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(30) @Max(3600) trackingIntervalSec?: number;
  @ApiPropertyOptional({ enum: CheckInScope, description: 'any_site: nearest work site validates · assigned_only: employees answer to their assigned site' })
  @IsOptional() @IsEnum(CheckInScope) checkInScope?: CheckInScope;
}

class OfficeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(20) @Max(20000) radiusMeters?: number;
}

class LeaveDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(365) annualLeaveDays?: number;
}

/** Per-site override: only the fields a site may customize. Scope and
 *  tracking cadence stay org-wide (they're assignment semantics, not site
 *  working conditions). */
class SitePolicyDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(240) lateAfterMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(720) halfDayMinutes?: number;
  @ApiPropertyOptional({ enum: OffSitePolicy, description: 'Off-site check-in: allowed | flag (default) | absent' })
  @IsOptional() @IsEnum(OffSitePolicy) offSiteCheckIn?: OffSitePolicy;
  @ApiPropertyOptional({ description: 'Face mismatch marks the day ABSENT (default: flag only)' })
  @IsOptional() @IsBoolean() absentOnFaceMismatch?: boolean;
  @ApiPropertyOptional({ description: '0=Sun … 6=Sat' }) @IsOptional() @IsArray() @IsInt({ each: true }) weeklyOffDays?: number[];
}

export class UpdateSiteSettingsDto {
  @ApiPropertyOptional({ type: OfficeHoursDto }) @IsOptional() @ValidateNested() @Type(() => OfficeHoursDto) officeHours?: OfficeHoursDto;
  @ApiPropertyOptional({ type: SitePolicyDto }) @IsOptional() @ValidateNested() @Type(() => SitePolicyDto) policy?: SitePolicyDto;
}

export class UpdateAttendanceSettingsDto {
  @ApiPropertyOptional({ example: 'Asia/Karachi' }) @IsOptional() @IsString() timezone?: string;
  @ApiPropertyOptional({ type: OfficeHoursDto }) @IsOptional() @ValidateNested() @Type(() => OfficeHoursDto) officeHours?: OfficeHoursDto;
  @ApiPropertyOptional({ type: PolicyDto }) @IsOptional() @ValidateNested() @Type(() => PolicyDto) policy?: PolicyDto;
  @ApiPropertyOptional({ type: OfficeDto }) @IsOptional() @ValidateNested() @Type(() => OfficeDto) office?: OfficeDto;
  @ApiPropertyOptional({ type: LeaveDto }) @IsOptional() @ValidateNested() @Type(() => LeaveDto) leave?: LeaveDto;
}
