import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { DeviceConnectionType } from '@prisma/client';

export class CreateDeviceDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;
  @ApiProperty({ example: 'ZKTeco' }) @IsString() @MaxLength(60) vendor!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() model?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serialNumber?: string;
  @ApiProperty({ enum: DeviceConnectionType }) @IsEnum(DeviceConnectionType) connectionType!: DeviceConnectionType;
  @ApiPropertyOptional() @IsOptional() @IsString() host?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() port?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() locationId?: string;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true }) @IsOptional() config?: Record<string, unknown>;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true }) @IsOptional() credentials?: Record<string, unknown>;
}

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}

export class MapUserDto {
  @ApiProperty() @IsString() deviceUserId!: string;
  @ApiProperty() @IsUUID() employeeId!: string;
}

export class IngestDto {
  @ApiProperty({ isArray: true })
  @IsArray()
  logs!: { deviceUserId: string; timestamp: string; direction?: 'in' | 'out'; raw?: unknown }[];
}
