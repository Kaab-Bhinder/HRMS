import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, MaxLength, ValidateNested,
} from 'class-validator';
import { CustomFieldEntity, CustomFieldType } from '@prisma/client';

class OptionDto {
  @ApiProperty() @IsString() value!: string;
  @ApiProperty() @IsString() label!: string;
}

export class CreateCustomFieldDto {
  @ApiProperty({ enum: CustomFieldEntity })
  @IsEnum(CustomFieldEntity)
  entity!: CustomFieldEntity;

  @ApiProperty({ example: 'passport_number' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_]{0,63}$/, { message: 'fieldKey must be snake_case (a-z, 0-9, _)' })
  fieldKey!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiProperty({ enum: CustomFieldType })
  @IsEnum(CustomFieldType)
  dataType!: CustomFieldType;

  @ApiPropertyOptional() @IsOptional() @IsString() helpText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) placeholder?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isUnique?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVisible?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isSearchable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFilterable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isEncrypted?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsInt() minValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() maxValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() minLength?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() maxLength?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() regexPattern?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() displayOrder?: number;

  @ApiPropertyOptional({ type: [OptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}

export class UpdateCustomFieldDto extends PartialType(CreateCustomFieldDto) {}

export class ReorderDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  orderedIds!: string[];
}
