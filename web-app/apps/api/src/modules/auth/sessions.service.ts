import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SessionView {
  id: string; // familyId
  device: string;
  browser: string | null;
  os: string | null;
  ipAddress: string | null;
  signedInAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  current: boolean;
}

/** A "session" is one refresh-token family (a login chain of rotated tokens).
 *  Exactly one non-revoked token exists per live family. */
@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Live sessions for a user. `currentFamilyId` marks the caller's own session. */
  async list(userId: string, currentFamilyId?: string): Promise<SessionView[]> {
    const now = new Date();
    const active = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
    });
    if (!active.length) return [];

    // Session start = earliest token in each family.
    const firsts = await this.prisma.refreshToken.groupBy({
      by: ['familyId'],
      where: { userId, familyId: { in: active.map((t) => t.familyId) } },
      _min: { createdAt: true },
    });
    const startByFamily = new Map(firsts.map((f) => [f.familyId, f._min.createdAt!]));

    return active.map((t) => {
      const ua = this.parseUserAgent(t.userAgent);
      return {
        id: t.familyId,
        device: ua.device,
        browser: ua.browser,
        os: ua.os,
        ipAddress: t.ipAddress,
        signedInAt: startByFamily.get(t.familyId) ?? t.createdAt,
        lastActiveAt: t.createdAt,
        expiresAt: t.expiresAt,
        current: !!currentFamilyId && t.familyId === currentFamilyId,
      };
    });
  }

  /** Revoke one session (family). Verifies it belongs to the user. */
  async revoke(userId: string, familyId: string): Promise<{ success: boolean }> {
    const one = await this.prisma.refreshToken.findFirst({ where: { userId, familyId } });
    if (!one) throw new NotFoundException('Session not found');
    await this.prisma.refreshToken.updateMany({ where: { userId, familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { success: true };
  }

  /** Revoke every live session for a user except (optionally) the current one. */
  async revokeAll(userId: string, exceptFamilyId?: string): Promise<{ success: boolean; revoked: number }> {
    const res = await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null, ...(exceptFamilyId ? { familyId: { not: exceptFamilyId } } : {}) },
      data: { revokedAt: new Date() },
    });
    return { success: true, revoked: res.count };
  }

  /** Admin guard helper — ensure the target user is in the same org. */
  async assertUserInOrg(orgId: string, userId: string) {
    const u = await this.prisma.user.findFirst({ where: { id: userId, organizationId: orgId, deletedAt: null }, select: { id: true } });
    if (!u) throw new ForbiddenException('User not found in your organization');
  }

  /** Minimal dependency-free UA parser — enough for a friendly device label. */
  private parseUserAgent(ua?: string | null): { device: string; browser: string | null; os: string | null } {
    if (!ua) return { device: 'Unknown device', browser: null, os: null };
    const os =
      /Windows/i.test(ua) ? 'Windows' :
      /iPhone|iPad|iOS/i.test(ua) ? 'iOS' :
      /Mac OS X|Macintosh/i.test(ua) ? 'macOS' :
      /Android/i.test(ua) ? 'Android' :
      /Linux/i.test(ua) ? 'Linux' : null;
    const browser =
      /Edg\//i.test(ua) ? 'Edge' :
      /OPR\/|Opera/i.test(ua) ? 'Opera' :
      /Chrome\//i.test(ua) ? 'Chrome' :
      /Firefox\//i.test(ua) ? 'Firefox' :
      /Safari\//i.test(ua) ? 'Safari' :
      /PostmanRuntime|curl|axios|node/i.test(ua) ? 'API client' : null;
    const device = [browser, os].filter(Boolean).join(' · ') || 'Unknown device';
    return { device, browser, os };
  }
}
