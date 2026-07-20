import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export const PLATFORMS = ['web', 'mobile'] as const;
export type Platform = (typeof PLATFORMS)[number];

export class LoginDto {
  @ApiProperty({ example: 'admin@acmebank.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Admin@12345' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ enum: PLATFORMS, default: 'web', description: 'Which app is signing in. React sends "web", Flutter sends "mobile".' })
  @IsOptional()
  @IsIn(PLATFORMS)
  platform?: Platform;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'The password currently in use — required to prove ownership of the session.' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
