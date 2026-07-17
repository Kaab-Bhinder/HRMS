import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) legalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64) timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(16) locale?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoUrl?: string;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true }) @IsOptional() @IsObject() settings?: Record<string, unknown>;
}

export class CreateLocationDto {
  @ApiPropertyOptional() @IsString() @MaxLength(150) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() latitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() radiusMeters?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64) timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
