import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean, IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';
import { LeaveRequestStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateLeaveTypeDto {
  @ApiProperty() @IsString() @MaxLength(80) name!: string;
  @ApiProperty() @IsString() @MaxLength(20) code!: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPaid?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() accrualPerYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() carryForwardMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowNegative?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(9) colorHex?: string;
}

export class UpdateLeaveTypeDto extends PartialType(CreateLeaveTypeDto) {}

export class CreateLeaveRequestDto {
  @ApiProperty() @IsUUID() leaveTypeId!: string;
  @ApiProperty() @IsDateString() startDate!: string;
  @ApiProperty() @IsDateString() endDate!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) reason?: string;
  /** Admins may apply on behalf of an employee; otherwise the current user's own employee is used. */
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class QueryLeaveRequestsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: LeaveRequestStatus }) @IsOptional() @IsEnum(LeaveRequestStatus) status?: LeaveRequestStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() leaveTypeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
}

export class DecisionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) comment?: string;
}
