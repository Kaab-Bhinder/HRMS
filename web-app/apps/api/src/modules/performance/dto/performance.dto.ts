import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { GoalStatus, ReviewStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

// --- Cycles ---
export class CreateCycleDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;
  @ApiProperty() @IsDateString() startDate!: string;
  @ApiProperty() @IsDateString() endDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateCycleDto extends PartialType(CreateCycleDto) {}

// --- Reviews ---
export class CreateReviewDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() cycleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() reviewerId?: string;
  @ApiPropertyOptional({ enum: ReviewStatus }) @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() overallScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export class QueryReviewsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ReviewStatus }) @IsOptional() @IsEnum(ReviewStatus) status?: ReviewStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() cycleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}

// --- Goals ---
export class CreateGoalDto {
  @ApiProperty() @IsString() @MaxLength(200) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) metric?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() targetValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() currentValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() weight?: number;
  @ApiPropertyOptional({ enum: GoalStatus }) @IsOptional() @IsEnum(GoalStatus) status?: GoalStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateGoalDto extends PartialType(CreateGoalDto) {}

export class QueryGoalsDto {
  @ApiPropertyOptional({ enum: GoalStatus }) @IsOptional() @IsEnum(GoalStatus) status?: GoalStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
}
