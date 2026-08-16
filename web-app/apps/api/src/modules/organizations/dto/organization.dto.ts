import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID, MaxLength, ValidateIf } from 'class-validator';
import { CompensationType } from '@prisma/client';

export class UpdateOrganizationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) legalName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(64) timezone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(16) locale?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3) currency?: string;
  @ApiPropertyOptional({ enum: CompensationType, description: 'Default pay model new employees inherit.' })
  @IsOptional() @IsEnum(CompensationType) defaultCompensationType?: CompensationType;
  /** The domain new work e-mail addresses are generated on. Without it the
   *  system infers one from existing staff, which is only ever a guess. */
  @ApiPropertyOptional({ description: 'e.g. pwigroup.id — no @ or scheme' })
  @IsOptional() @IsString() @MaxLength(120) emailDomain?: string;
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
  @ApiPropertyOptional({ description: 'Set when this site is a CLIENT\'s premises (outsourced staff clock in there). Null = the org\'s own branch.' })
  @IsOptional() @ValidateIf((o) => o.clientId !== null) @IsUUID() clientId?: string | null;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
