import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { CreateEmployeeDto } from '../../employees/dto/employee.dto';

/** How a department's (compulsory) head is provided at creation: either an
 *  existing employee, or a brand-new employee created inline as the head. */
export class DepartmentHeadDto {
  @ApiPropertyOptional({ description: 'Assign an existing employee as head' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ type: CreateEmployeeDto, description: 'Create a new employee as head' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateEmployeeDto)
  newEmployee?: CreateEmployeeDto;
}

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Directly set head by employee id (updates); use `head` for creation' })
  @IsOptional()
  @IsUUID()
  headEmployeeId?: string;

  @ApiPropertyOptional({ type: DepartmentHeadDto, description: 'Compulsory head for a new department' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DepartmentHeadDto)
  head?: DepartmentHeadDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  costCenter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}
