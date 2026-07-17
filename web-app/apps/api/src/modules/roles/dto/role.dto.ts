import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Permission keys, e.g. ["employees:read"]' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Can users with this role sign in to the web admin app' })
  @IsOptional()
  @IsBoolean()
  canAccessWeb?: boolean;

  @ApiPropertyOptional({ description: 'Can users with this role sign in to the mobile app' })
  @IsOptional()
  @IsBoolean()
  canAccessMobile?: boolean;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
