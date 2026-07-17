import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { TokenService } from './token.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { Platform } from './dto/login.dto';

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  /** Validates credentials + platform access and returns access + refresh tokens. */
  async login(email: string, password: string, meta: RequestMeta, platform: Platform = 'web') {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });

    // Uniform failure message to avoid account enumeration.
    const invalid = () => new UnauthorizedException('Invalid email or password');
    if (!user || !user.passwordHash) throw invalid();

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }
    if (user.status === 'suspended' || user.status === 'disabled') {
      throw new UnauthorizedException('Account is not active');
    }

    const ok = await argon2.verify(user.passwordHash, password).catch(() => false);
    if (!ok) {
      const failed = user.failedAttempts + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: failed,
          lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
        },
      });
      throw invalid();
    }

    // Platform gate — an auth-time capability, separate from permissions.
    // Deliberately NOT bypassed for super admins (platform ⊥ authorization).
    await this.assertPlatformAllowed(user.id, platform);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    return this.issueTokens(user.id, meta, platform);
  }

  async refresh(rawToken: string, meta: RequestMeta) {
    const { userId, refreshToken, platform } = await this.tokens.rotateRefreshToken(rawToken, meta);
    // Re-validate: a role's platform access may have been revoked mid-session.
    await this.assertPlatformAllowed(userId, platform);
    const ctx = await this.getAuthContext(userId);
    const accessToken = await this.tokens.issueAccessToken(this.toPayload(ctx, platform));
    return { accessToken, refreshToken, user: ctx, platform };
  }

  async logout(rawToken?: string) {
    if (rawToken) await this.tokens.revokeFamilyByToken(rawToken);
    return { success: true };
  }

  async me(userId: string): Promise<AuthUser> {
    return this.getAuthContext(userId);
  }

  // --- helpers ---

  private async issueTokens(userId: string, meta: RequestMeta, platform: Platform) {
    const ctx = await this.getAuthContext(userId);
    const accessToken = await this.tokens.issueAccessToken(this.toPayload(ctx, platform));
    const refreshToken = await this.tokens.issueRefreshToken(userId, this.tokens.newFamilyId(), meta, platform);
    return { accessToken, refreshToken, user: ctx };
  }

  /** Union of a user's roles' platform flags. Super admins are NOT auto-granted. */
  async getAllowedPlatforms(userId: string): Promise<string[]> {
    const rows = await this.prisma.userRole.findMany({
      where: { userId, role: { deletedAt: null } },
      select: { role: { select: { canAccessWeb: true, canAccessMobile: true } } },
    });
    const set = new Set<string>();
    for (const r of rows) {
      if (r.role.canAccessWeb) set.add('web');
      if (r.role.canAccessMobile) set.add('mobile');
    }
    return [...set];
  }

  private async assertPlatformAllowed(userId: string, platform: string) {
    const allowed = await this.getAllowedPlatforms(userId);
    if (!allowed.includes(platform)) {
      throw new ForbiddenException(`This account is not permitted to access the ${platform} application`);
    }
  }

  /** Loads a user with role slugs and flattened permission keys. */
  async getAuthContext(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user || user.deletedAt) throw new UnauthorizedException('User not found');

    const roles = user.roles.map((ur) => ur.role.slug);
    const permissions = Array.from(
      new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key))),
    );

    return {
      id: user.id,
      organizationId: user.organizationId,
      email: user.email,
      fullName: user.fullName,
      isSuperAdmin: user.isSuperAdmin,
      roles,
      permissions: user.isSuperAdmin ? ['*'] : permissions,
    };
  }

  private toPayload(ctx: AuthUser, platform: string): JwtPayload {
    return {
      sub: ctx.id,
      org: ctx.organizationId,
      email: ctx.email,
      name: ctx.fullName,
      sa: ctx.isSuperAdmin,
      roles: ctx.roles,
      perms: ctx.permissions,
      platform,
    };
  }
}
