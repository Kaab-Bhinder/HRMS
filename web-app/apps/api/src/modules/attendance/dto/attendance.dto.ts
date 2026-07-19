import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, ValidateNested,
} from 'class-validator';
import { AttendanceMethod, PunchType, AttendanceDayStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class PunchDto {
  @ApiProperty({ enum: PunchType }) @IsEnum(PunchType) type!: PunchType;
  @ApiProperty({ enum: AttendanceMethod }) @IsEnum(AttendanceMethod) method!: AttendanceMethod;

  @ApiPropertyOptional({ description: 'Admin punching on behalf; omit for self' })
  @IsOptional() @IsUUID() employeeId?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString() occurredAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() accuracyMeters?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() qrToken?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() faceImageKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() deviceId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOffline?: boolean;
  @ApiPropertyOptional({ description: 'Device reported the GPS fix as mocked/faked' })
  @IsOptional() @IsBoolean() isMocked?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() clientCreatedAt?: string;
  @ApiPropertyOptional() @IsOptional() metadata?: Record<string, unknown>;
}

class PingPointDto {
  @ApiProperty() @IsDateString() recordedAt!: string;
  @ApiProperty() @IsNumber() latitude!: number;
  @ApiProperty() @IsNumber() longitude!: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() accuracyMeters?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() speed?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() battery?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isMoving?: boolean;
}

export class PingDto {
  @ApiProperty() @IsUUID() sessionId!: string;
  @ApiProperty({ type: [PingPointDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => PingPointDto)
  points!: PingPointDto[];
}

export class ManualEntryDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiProperty() @IsDateString() workDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkInAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() checkOutAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class RegularizationDto {
  @ApiProperty() @IsDateString() workDate!: string;
  @ApiProperty() @IsString() reason!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() requestedInAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() requestedOutAt?: string;
}

export class QueryAttendanceDto extends PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional({ enum: AttendanceDayStatus }) @IsOptional() @IsEnum(AttendanceDayStatus) status?: AttendanceDayStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() @Type(() => Boolean) flagged?: boolean;
}
