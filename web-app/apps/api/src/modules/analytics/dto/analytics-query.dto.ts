import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

/** Common optional filters shared by all analytics endpoints. */
export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'ISO date (inclusive lower bound)' })
  @IsOptional() @IsDateString() from?: string;

  @ApiPropertyOptional({ description: 'ISO date (inclusive upper bound)' })
  @IsOptional() @IsDateString() to?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}
