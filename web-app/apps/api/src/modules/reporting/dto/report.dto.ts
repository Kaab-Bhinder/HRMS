import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportPeriodType, ReportStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty({ enum: ReportPeriodType })
  @IsEnum(ReportPeriodType)
  periodType!: ReportPeriodType;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  periodStart!: string;

  @ApiProperty({ example: '2026-07-31' })
  @IsDateString()
  periodEnd!: string;

  @ApiPropertyOptional({ description: 'Human label, e.g. "July 2026" or "Week of Jul 7"' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  periodLabel?: string;

  @ApiProperty()
  @IsString()
  summary!: string;
}

export class ReviewReportDto {
  @ApiProperty({ enum: ['reviewed', 'acknowledged'] })
  @IsIn(['reviewed', 'acknowledged'])
  status!: 'reviewed' | 'acknowledged';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class QueryReportsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportPeriodType })
  @IsOptional()
  @IsEnum(ReportPeriodType)
  periodType?: ReportPeriodType;

  @ApiPropertyOptional({ description: 'Only my own submissions' })
  @IsOptional()
  @IsIn(['true', 'false'])
  mine?: string;
}
