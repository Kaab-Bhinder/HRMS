import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { ShiftType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AttendanceSettingsService } from './attendance-settings.service';
import { UpdateAttendanceSettingsDto } from './dto/attendance-settings.dto';

class ShiftDto {
  @IsString() @MaxLength(100) name!: string;
  @IsEnum(ShiftType) type!: ShiftType;
  @IsString() startTime!: string;
  @IsString() endTime!: string;
  @IsOptional() @IsInt() graceMinutes?: number;
  @IsOptional() @IsInt() breakMinutes?: number;
  @IsOptional() @IsBoolean() isNight?: boolean;
}
class HolidayDto {
  @IsString() @MaxLength(120) name!: string;
  @IsDateString() date!: string;
  @IsOptional() @IsBoolean() isOptional?: boolean;
}
class PolicyDto {
  @IsString() @MaxLength(120) name!: string;
  @IsOptional() @IsInt() graceMinutes?: number;
  @IsOptional() @IsInt() lateAfterMinutes?: number;
  @IsOptional() @IsInt() halfDayMinutes?: number;
  @IsOptional() @IsInt() overtimeAfterMinutes?: number;
  @IsOptional() @IsBoolean() enforceGeofence?: boolean;
  @IsOptional() @IsBoolean() allowRemote?: boolean;
  @IsOptional() @IsArray() allowedMethods?: string[];
  @IsOptional() @IsArray() weeklyOffDays?: number[];
  @IsOptional() @IsInt() trackingIntervalSec?: number;
}

@ApiTags('Attendance Config')
@ApiBearerAuth()
@Controller()
export class AttendanceConfigController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: AttendanceSettingsService,
  ) {}

  // Consolidated attendance settings (office hours, break, geofence, leaves)
  @Get('attendance/settings') @RequirePermissions('attendance:read')
  getSettings(@CurrentUser('organizationId') orgId: string) {
    return this.settings.get(orgId);
  }
  @Put('attendance/settings') @RequirePermissions('attendance:update')
  updateSettings(@CurrentUser('organizationId') orgId: string, @Body() dto: UpdateAttendanceSettingsDto) {
    return this.settings.update(orgId, dto);
  }

  // Shifts
  @Get('shifts') @RequirePermissions('shifts:read')
  shifts(@CurrentUser('organizationId') orgId: string) {
    return this.prisma.shift.findMany({ where: { organizationId: orgId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
  @Post('shifts') @RequirePermissions('shifts:create')
  createShift(@CurrentUser('organizationId') orgId: string, @Body() dto: ShiftDto) {
    return this.prisma.shift.create({ data: { organizationId: orgId, ...dto } });
  }
  @Patch('shifts/:id') @RequirePermissions('shifts:update')
  updateShift(@Param('id') id: string, @Body() dto: Partial<ShiftDto>) {
    return this.prisma.shift.update({ where: { id }, data: dto });
  }
  @Delete('shifts/:id') @RequirePermissions('shifts:delete')
  removeShift(@Param('id') id: string) {
    return this.prisma.shift.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // Holidays
  @Get('holidays') @RequirePermissions('attendance:read')
  holidays(@CurrentUser('organizationId') orgId: string) {
    return this.prisma.holiday.findMany({ where: { organizationId: orgId }, orderBy: { date: 'asc' } });
  }
  @Post('holidays') @RequirePermissions('attendance:create')
  createHoliday(@CurrentUser('organizationId') orgId: string, @Body() dto: HolidayDto) {
    return this.prisma.holiday.create({ data: { organizationId: orgId, name: dto.name, date: new Date(dto.date), isOptional: dto.isOptional ?? false } });
  }
  @Delete('holidays/:id') @RequirePermissions('attendance:delete')
  removeHoliday(@Param('id') id: string) {
    return this.prisma.holiday.delete({ where: { id } });
  }

  // Policies
  @Get('attendance-policies') @RequirePermissions('attendance:read')
  policies(@CurrentUser('organizationId') orgId: string) {
    return this.prisma.attendancePolicy.findMany({ where: { organizationId: orgId, deletedAt: null } });
  }
  @Post('attendance-policies') @RequirePermissions('attendance:update')
  createPolicy(@CurrentUser('organizationId') orgId: string, @Body() dto: PolicyDto) {
    return this.prisma.attendancePolicy.create({ data: { organizationId: orgId, ...dto } });
  }
  @Patch('attendance-policies/:id') @RequirePermissions('attendance:update')
  updatePolicy(@Param('id') id: string, @Body() dto: Partial<PolicyDto>) {
    return this.prisma.attendancePolicy.update({ where: { id }, data: dto });
  }
}
