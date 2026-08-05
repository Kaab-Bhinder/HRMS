import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested,
} from 'class-validator';
import { EmploymentType, EmployeeStatus, Gender, CompensationType } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export const PASSWORD_STRATEGIES = ['generate', 'invite'] as const;
export type PasswordStrategy = (typeof PASSWORD_STRATEGIES)[number];

export class CreateEmployeeDto {
  @ApiProperty() @IsString() @MaxLength(80) firstName!: string;
  @ApiProperty() @IsString() @MaxLength(80) lastName!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) employeeCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() workEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() personalEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional({ description: 'Profile photo: an uploaded FileObject id.' })
  @IsOptional() @IsUUID() photoFileId?: string;
  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() designationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() managerId?: string;

  @ApiPropertyOptional({ enum: EmploymentType }) @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @ApiPropertyOptional({ enum: EmployeeStatus }) @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfJoining?: string;

  @ApiPropertyOptional({ enum: CompensationType, description: 'monthly → paid basicSalary; hourly → payPerHour × attendance. Defaults to the org default.' })
  @IsOptional() @IsEnum(CompensationType) compensationType?: CompensationType;

  @ApiPropertyOptional({ description: 'Fixed monthly salary, used when compensationType = monthly.' })
  @IsOptional() @IsNumber() @Min(0) @Max(100000000) @Type(() => Number) basicSalary?: number;

  @ApiPropertyOptional({ description: 'Hourly pay rate used when compensationType = hourly.' })
  @IsOptional() @IsNumber() @Min(0) @Max(1000000) @Type(() => Number) payPerHour?: number;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, unknown>;

  // --- Account section: a linked login User is created with the employee ---
  @ApiPropertyOptional({ default: true, description: 'Create a linked login account (default true).' })
  @IsOptional() @IsBoolean() createAccount?: boolean;

  @ApiPropertyOptional({ description: 'Role for the login account. Defaults to the "Employee" role.' })
  @IsOptional() @IsUUID() accountRoleId?: string;

  @ApiPropertyOptional({ enum: PASSWORD_STRATEGIES, default: 'generate', description: '"generate" returns a one-time password; "invite" creates the account as invited.' })
  @IsOptional() @IsIn(PASSWORD_STRATEGIES) accountPasswordStrategy?: PasswordStrategy;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class QueryEmployeesDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: EmployeeStatus }) @IsOptional() @IsEnum(EmployeeStatus) status?: EmployeeStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() designationId?: string;
  @ApiPropertyOptional({ enum: EmploymentType }) @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  /** Filter by one custom field: cfKey + cfValue (uses the JSONB GIN index). */
  @ApiPropertyOptional() @IsOptional() @IsString() cfKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cfValue?: string;
}

export class BulkImportDto {
  @ApiProperty({ type: [CreateEmployeeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmployeeDto)
  rows!: CreateEmployeeDto[];
}
