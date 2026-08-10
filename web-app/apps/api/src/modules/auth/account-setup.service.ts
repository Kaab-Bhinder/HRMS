import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AccountTokenPurpose, NotificationChannel as Channel, UserStatus } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../database/prisma.service';
import { appUrl } from '../../common/utils/app-url.util';
import { NotificationsService } from '../notifications/notifications.service';

/** How long an invitation stays usable. Long enough for a weekend, short
 *  enough that a forwarded e-mail isn't a standing key to the account. */
const INVITE_TTL_HOURS = 72;
const RESET_TTL_HOURS = 2;

/**
 * Invitations and password resets.
 *
 * Before this existed, choosing "Send invitation" created an account with NO
 * password and no way to obtain one — the person was locked out permanently.
 * Now they receive a single-use link and set their own password.
 *
 * Only a SHA-256 hash of each token is stored, so a leaked database row cannot
 * be redeemed. The plaintext exists only in the e-mail.
 */
@Injectable()
export class AccountSetupService {
  private readonly log = new Logger(AccountSetupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Issues a link and e-mails it. `sendTo` lets an invitation go to a PERSONAL
   * address — before someone's first login their company mailbox usually does
   * not exist yet, which is why invitations to the work address bounce.
   */
  async issue(
    orgId: string,
    userId: string,
    purpose: AccountTokenPurpose = AccountTokenPurpose.invite,
    sendTo?: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId: orgId, deletedAt: null },
      select: {
        id: true, email: true, fullName: true,
        roles: { select: { role: { select: { canAccessWeb: true, canAccessMobile: true } } } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    // Roles carry a platform gate. Telling someone to "sign in" without saying
    // where sends mobile-only staff to a web login that will refuse them.
    const web = user.roles.some((r) => r.role.canAccessWeb);
    const mobile = user.roles.some((r) => r.role.canAccessMobile);
    const where = web && mobile ? 'the web app or the mobile app'
      : web ? 'the web app'
        : mobile ? 'the mobile app'
          : 'your assigned app';

    const destination = sendTo?.trim() || user.email;
    const token = randomBytes(32).toString('base64url');
    const ttl = purpose === AccountTokenPurpose.invite ? INVITE_TTL_HOURS : RESET_TTL_HOURS;

    // Supersede any earlier unused link so only the newest one works.
    await this.prisma.accountToken.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    });
    await this.prisma.accountToken.create({
      data: {
        userId,
        purpose,
        tokenHash: this.hash(token),
        expiresAt: new Date(Date.now() + ttl * 3_600_000),
      },
    });

    const link = `${appUrl()}/set-password?token=${token}`;
    const isInvite = purpose === AccountTokenPurpose.invite;
    const title = isInvite ? 'Your account is ready' : 'Reset your password';
    const body = isInvite
      ? `Hello ${user.fullName},\n\nAn account has been created for you.\nSet your password here (valid for ${ttl} hours):\n\n${link}\n\nYou will sign in to ${where} with: ${user.email}`
      : `Hello ${user.fullName},\n\nReset your password here (valid for ${ttl} hours):\n\n${link}\n\nIf you did not request this, ignore this e-mail.`;

    await this.notifications
      .notify(orgId, userId, {}, {
        channels: [Channel.email, Channel.in_app],
        eventKey: isInvite ? 'account.invited' : 'account.reset',
        category: 'system',
        title,
        body,
        email: destination,
        html: `<p>Hello ${user.fullName},</p><p>${isInvite ? 'An account has been created for you.' : 'You asked to reset your password.'}</p><p><a href="${link}">Set your password</a> (valid for ${ttl} hours)</p><p>You sign in to ${where} with: <b>${user.email}</b></p>`,
      })
      .catch((e) => this.log.warn(`invite e-mail to ${destination} failed: ${e.message}`));

    // The link is returned so HR can copy it when e-mail isn't configured yet —
    // otherwise a missing SMTP host would silently strand the new employee.
    return { sentTo: destination, expiresInHours: ttl, link };
  }

  /** Lets the set-password page show who it is for before asking for input. */
  async inspect(token: string) {
    const row = await this.prisma.accountToken.findUnique({
      where: { tokenHash: this.hash(token) },
      include: { user: { select: { email: true, fullName: true } } },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('This link is invalid or has expired. Ask HR to send a new one.');
    }
    return { email: row.user.email, fullName: row.user.fullName, purpose: row.purpose };
  }

  /** Consumes the token and sets the password. Single use, enforced in a
   *  transaction so the same link cannot be redeemed twice concurrently. */
  async setPassword(token: string, password: string) {
    if (password.length < 8) throw new BadRequestException('Password must be at least 8 characters');

    const row = await this.prisma.accountToken.findUnique({
      where: { tokenHash: this.hash(token) },
      select: { id: true, userId: true, usedAt: true, expiresAt: true },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new BadRequestException('This link is invalid or has expired. Ask HR to send a new one.');
    }

    const passwordHash = await argon2.hash(password);
    await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.accountToken.updateMany({
        where: { id: row.id, usedAt: null },
        data: { usedAt: new Date() },
      });
      if (claimed.count === 0) throw new BadRequestException('This link has already been used');

      await tx.user.update({
        where: { id: row.userId },
        data: { passwordHash, status: UserStatus.active, passwordChangedAt: new Date() },
      });
      // Any existing session is invalidated — if the reset was triggered
      // because of a compromise, the intruder is signed out.
      await tx.refreshToken.updateMany({
        where: { userId: row.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    });
    return { success: true };
  }
}
