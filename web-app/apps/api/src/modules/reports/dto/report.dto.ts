import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsIn, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export const REPORT_MODULES = ['employees', 'attendance', 'leave'] as const;
export type ReportModule = (typeof REPORT_MODULES)[number];

export const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export class CreateSavedReportDto {
  @ApiProperty() @IsString() @MaxLength(150) name!: string;
  @ApiProperty({ enum: REPORT_MODULES }) @IsIn(REPORT_MODULES as unknown as string[]) module!: ReportModule;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  definition!: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) scheduleCron?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];
}

export class UpdateSavedReportDto extends PartialType(CreateSavedReportDto) {}

export class QuerySavedReportsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: REPORT_MODULES })
  @IsOptional()
  @IsIn(REPORT_MODULES as unknown as string[])
  module?: ReportModule;
}

/** Query params for GET /reports/export. Extra filters map to per-module Prisma where clauses. */
export class RunReportQueryDto {
  @ApiProperty({ enum: REPORT_MODULES })
  @IsIn(REPORT_MODULES as unknown as string[])
  module!: ReportModule;

  @ApiPropertyOptional({ enum: EXPORT_FORMATS, default: 'csv' })
  @IsOptional()
  @IsIn(EXPORT_FORMATS as unknown as string[])
  format: ExportFormat = 'csv';

  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() leaveTypeId?: string;
  /** Inclusive lower bound for the module's primary date column (ISO date). */
  @ApiPropertyOptional() @IsOptional() @IsString() from?: string;
  /** Inclusive upper bound for the module's primary date column (ISO date). */
  @ApiPropertyOptional() @IsOptional() @IsString() to?: string;
}
