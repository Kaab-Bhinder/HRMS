import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsIn, IsNumber, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { AssetStatus } from '@prisma/client';

export class CreateAssetDto {
  @ApiProperty() @IsString() @MaxLength(200) name!: string;
  @ApiPropertyOptional({ description: 'Unique tag; auto-generated when omitted.' })
  @IsOptional() @IsString() @MaxLength(60) assetTag?: string;
  @ApiProperty() @IsString() @MaxLength(60) category!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) serialNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() purchaseDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100000000000) @Type(() => Number) purchaseCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) vendor?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() warrantyUntil?: string;
  @ApiPropertyOptional({ enum: AssetStatus }) @IsOptional() @IsEnum(AssetStatus) status?: AssetStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) condition?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional() @IsObject() customFields?: Record<string, unknown>;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}

export class AssignAssetDto {
  @ApiProperty() @IsUUID() employeeId!: string;
  @ApiPropertyOptional({ description: 'Condition at issue (e.g. new / good / fair).' })
  @IsOptional() @IsString() @MaxLength(40) condition?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ReturnAssetDto {
  @ApiPropertyOptional({ description: 'Condition at return.' })
  @IsOptional() @IsString() @MaxLength(40) condition?: string;
  @ApiPropertyOptional({ description: 'Where the asset goes next.', enum: ['available', 'in_repair', 'retired', 'lost'] })
  @IsOptional() @IsIn(['available', 'in_repair', 'retired', 'lost']) nextStatus?: 'available' | 'in_repair' | 'retired' | 'lost';
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
