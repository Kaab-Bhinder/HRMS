import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength,
} from 'class-validator';

export enum UserStatusDto {
  invited = 'invited',
  active = 'active',
  suspended = 'suspended',
  disabled = 'disabled',
}

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(150)
  fullName!: string;

  @ApiPropertyOptional({ type: [String], description: 'Role ids to assign' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({ description: 'Set an initial password (else the user is created as "invited")' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({ enum: UserStatusDto })
  @IsOptional()
  @IsEnum(UserStatusDto)
  status?: UserStatusDto;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({ enum: UserStatusDto })
  @IsOptional()
  @IsEnum(UserStatusDto)
  status?: UserStatusDto;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
