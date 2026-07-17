import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';

interface RequestMeta {
  userAgent?: string;
  ipAddress?: string;
}

/** Issues access tokens and manages rotating refresh tokens with reuse detection. */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async issueAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessTtl'),
    });
  }

  /** Creates a new refresh token row (hashed at rest) and returns the raw token.
   *  `platform` records which app opened the session; it survives rotation. */
  async issueRefreshToken(userId: string, familyId: string, meta: RequestMeta, platform = 'web'): Promise<string> {
    const jti = uuid();
    const token = await this.jwt.signAsync(
      { sub: userId, family: familyId, jti },
      { secret: this.config.get<string>('jwt.refreshSecret'), expiresIn: this.config.get<string>('jwt.refreshTtl') },
    );
    const decoded = this.jwt.decode(token) as { exp: number };
    await this.prisma.refreshToken.create({
      data: {
        id: jti,
        userId,
        familyId,
        platform,
        tokenHash: await argon2.hash(token),
        expiresAt: new Date(decoded.exp * 1000),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });
    return token;
  }

  /** Verifies + rotates a refresh token. Detects reuse and revokes the whole family. */
  async rotateRefreshToken(rawToken: string, meta: RequestMeta): Promise<{ userId: string; refreshToken: string; platform: string }> {
    let payload: { sub: string; family: string; jti: string };
    try {
      payload = await this.jwt.verifyAsync(rawToken, { secret: this.config.get<string>('jwt.refreshSecret') });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const record = await this.prisma.refreshToken.findUnique({ where: { id: payload.jti } });
    if (!record) throw new UnauthorizedException('Refresh token not recognized');

    // Reuse of an already-rotated token → likely theft. Revoke the entire family.
    if (record.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: record.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected — session revoked');
    }

    const valid = await argon2.verify(record.tokenHash, rawToken).catch(() => false);
    if (!valid || record.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');

    const newToken = await this.issueRefreshToken(record.userId, record.familyId, meta, record.platform);
    const newJti = (this.jwt.decode(newToken) as { jti: string }).jti;
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), replacedBy: newJti },
    });

    return { userId: record.userId, refreshToken: newToken, platform: record.platform };
  }

  async revokeFamilyByToken(rawToken: string): Promise<void> {
    const decoded = this.jwt.decode(rawToken) as { jti?: string } | null;
    if (!decoded?.jti) return;
    const record = await this.prisma.refreshToken.findUnique({ where: { id: decoded.jti } });
    if (!record) return;
    await this.prisma.refreshToken.updateMany({
      where: { familyId: record.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  newFamilyId(): string {
    return uuid();
  }

  /** Best-effort: resolve the family id from a raw refresh token (to mark "this session"). */
  async familyFromToken(rawToken?: string): Promise<string | undefined> {
    if (!rawToken) return undefined;
    try {
      const payload = await this.jwt.verifyAsync<{ family: string }>(rawToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
      return payload.family;
    } catch {
      return undefined;
    }
  }
}
