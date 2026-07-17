import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** Mobile clients (no cookie jar) pass the refresh token in the body.
 *  Web clients omit it and rely on the httpOnly refresh cookie. */
export class RefreshDto {
  @ApiPropertyOptional({ description: 'Refresh token (mobile clients). Web uses the httpOnly cookie instead.' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
