import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDateString, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateTaskDto {
  @ApiProperty() @IsString() @MaxLength(200) title!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() parentTaskId?: string;

  @ApiPropertyOptional({ enum: TaskStatus }) @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @ApiPropertyOptional({ enum: TaskPriority }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional() @IsInt() @Min(0) @Max(100) progress?: number;

  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() estimatedHours?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() actualHours?: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class QueryTasksDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus }) @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
  @ApiPropertyOptional({ enum: TaskPriority }) @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() assigneeId?: string;
}

export class AssignTaskDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) role?: string;
}

export class CreateCommentDto {
  @ApiProperty() @IsString() body!: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus }) @IsEnum(TaskStatus) status!: TaskStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional() @IsInt() @Min(0) @Max(100) progress?: number;
}
