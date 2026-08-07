import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEmail, MinLength } from 'class-validator';

/** Mobile clients (no cookie jar) pass the refresh token in the body.
 *  Web clients omit it and rely on the httpOnly refresh cookie. */
export class RefreshDto {
  @ApiPropertyOptional({ description: 'Refresh token (mobile clients). Web uses the httpOnly cookie instead.' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class InviteDto {
  @ApiProperty() @IsUUID() userId!: string;
  /** Personal address to send to. Falls back to the login e-mail. */
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
}

export class SetPasswordDto {
  @ApiProperty() @IsString() token!: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) password!: string;
}
