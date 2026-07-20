import { Body, Controller, Delete, Get, HttpCode, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { SessionsService } from './sessions.service';
import { ChangePasswordDto, LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
    private readonly tokens: TokenService,
    private readonly sessions: SessionsService,
  ) {}

  private cookieName() {
    return this.config.get<string>('cookie.refreshName')!;
  }

  private setRefreshCookie(res: Response, token: string) {
    const isProduction = this.config.get('env') === 'production';
    // In production the dashboard and API sit on different sites (vercel.app vs
    // onrender.com), and a browser will not send a SameSite=Strict cookie
    // across that boundary — every session would die when the 15-minute access
    // token expired. 'none' permits it, and requires Secure, which production
    // already sets. Locally both run on localhost, so 'strict' still holds and
    // keeps the stronger CSRF protection where it costs nothing.
    //
    // Once the API moves behind the same registrable domain as the dashboard
    // (api.client.com + app.client.com), change this back to 'lax': it is
    // same-site then, and 'none' would be needlessly permissive.
    res.cookie(this.cookieName(), token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private meta(req: Request) {
    return { userAgent: req.headers['user-agent'], ipAddress: req.ip };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate and receive an access token (+ refresh cookie)' })
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const platform = dto.platform ?? 'web';
    const { accessToken, refreshToken, user } = await this.auth.login(dto.email, dto.password, this.meta(req), platform);
    // Web keeps the refresh token in an httpOnly cookie; mobile (no cookie jar)
    // gets it in the body to store in secure storage.
    this.setRefreshCookie(res, refreshToken);
    return platform === 'mobile' ? { accessToken, refreshToken, user } : { accessToken, user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate tokens using the refresh cookie (web) or body token (mobile)' })
  async refresh(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[this.cookieName()] ?? dto.refreshToken;
    if (!raw) throw new UnauthorizedException('No refresh token');
    const { accessToken, refreshToken, user, platform } = await this.auth.refresh(raw, this.meta(req));
    this.setRefreshCookie(res, refreshToken);
    return platform === 'mobile' ? { accessToken, refreshToken, user } : { accessToken, user };
  }

  @Post('change-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: "Change your own password (requires the current one)" })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    // Not @Public: the caller must already be signed in. The current refresh
    // token identifies this session so it survives while every other one is
    // revoked.
    const currentRefresh = req.cookies?.[this.cookieName()];
    return this.auth.changePassword(userId, dto.currentPassword, dto.newPassword, currentRefresh);
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Body() dto: RefreshDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.[this.cookieName()] ?? dto.refreshToken);
    res.clearCookie(this.cookieName(), { path: '/' });
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Current authenticated user with roles and permissions' })
  async me(@CurrentUser('id') userId: string): Promise<AuthUser> {
    return this.auth.me(userId);
  }

  // --- self-service session management (any authenticated user, own sessions) ---

  @Get('sessions')
  @ApiOperation({ summary: 'List the current user’s active sessions (devices)' })
  async listSessions(@CurrentUser('id') userId: string, @Req() req: Request) {
    const currentFamily = await this.tokens.familyFromToken(req.cookies?.[this.cookieName()]);
    return this.sessions.list(userId, currentFamily);
  }

  @Delete('sessions/others')
  @ApiOperation({ summary: 'Sign out of every other session, keeping the current one' })
  async revokeOtherSessions(@CurrentUser('id') userId: string, @Req() req: Request) {
    const currentFamily = await this.tokens.familyFromToken(req.cookies?.[this.cookieName()]);
    return this.sessions.revokeAll(userId, currentFamily);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Revoke a specific session by id' })
  async revokeSession(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.sessions.revoke(userId, id);
  }
}
