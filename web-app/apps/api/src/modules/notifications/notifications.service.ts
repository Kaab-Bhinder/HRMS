import { Inject, Injectable } from '@nestjs/common';
import { NotificationChannel as Channel, NotificationPriority, Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ChannelRegistry, NOTIFICATION_CHANNEL_REGISTRY } from './channels/notification-channel.interface';

export interface NotifyOptions {
  eventKey?: string;
  category?: string;
  priority?: NotificationPriority;
  channels?: Channel[]; // default: [in_app] (+ any the caller requests)
  data?: Record<string, unknown>;
  scheduledAt?: Date;
  locale?: string;
  title?: string; // used when no template resolves
  body?: string;
  /** Overrides the recipient's login address for off-app channels. */
  email?: string;
  /** Overrides the recipient's stored number for SMS/WhatsApp, in E.164. */
  phone?: string;
  html?: string;
  /** Pre-approved template for channels that require one (WhatsApp). */
  template?: { name: string; language?: string; params?: string[] };
}

/**
 * Core notification service. Renders templates, honors per-user channel
 * preferences and priorities, supports scheduling, fans out to channel
 * providers, and writes a delivery log per channel. Other modules call
 * `notify()`; the channel set is data-driven so new channels need no change here.
 */
@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_CHANNEL_REGISTRY) private readonly channels: ChannelRegistry,
  ) {}

  async notify(orgId: string, recipientUserId: string, ctx: Record<string, unknown>, opts: NotifyOptions = {}) {
    const wanted = opts.channels?.length ? opts.channels : [Channel.in_app];
    const enabled = await this.filterByPreferences(recipientUserId, opts.eventKey, wanted);

    let inAppId: string | undefined;
    for (const channel of enabled) {
      const provider = this.channels.get(channel);
      if (!provider) continue;

      const rendered = await this.render(orgId, opts.eventKey, channel, opts.locale ?? 'en', ctx, opts);
      const result = await provider.send({
        organizationId: orgId,
        recipientUserId,
        title: rendered.title,
        body: rendered.body,
        data: opts.data,
        // Off-app channels need somewhere to deliver to. Prefer an explicit
        // override (an invite goes to a PERSONAL address, which is often the
        // only one that works before the person has a company mailbox).
        email: opts.email ?? (await this.addressFor(recipientUserId)),
        phone: opts.phone ?? (await this.phoneFor(recipientUserId)),
        html: opts.html,
        template: opts.template,
      });
      if (channel === Channel.in_app && result.providerRef) inAppId = result.providerRef;

      await this.prisma.notificationDeliveryLog.create({
        data: {
          organizationId: orgId,
          notificationId: channel === Channel.in_app ? result.providerRef : undefined,
          channel,
          status: result.status,
          providerRef: result.providerRef,
          error: result.error,
        },
      });
    }
    return { delivered: enabled, inAppId };
  }

  /** The employee's mobile number, used when the caller doesn't override it. */
  private async phoneFor(userId: string): Promise<string | undefined> {
    const emp = await this.prisma.employee.findFirst({
      where: { userId, deletedAt: null },
      select: { phone: true },
    });
    return emp?.phone ?? undefined;
  }

  /** The login address, used when the caller doesn't override it. */
  private async addressFor(userId: string): Promise<string | undefined> {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    return u?.email;
  }

  // --- in-app inbox ---
  async list(userId: string, opts: { unreadOnly?: boolean; page?: number; limit?: number }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const where: Prisma.NotificationWhereInput = { recipientUserId: userId, ...(opts.unreadOnly ? { readAt: null } : {}) };
    const [rows, total, unread] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { recipientUserId: userId, readAt: null } }),
    ]);
    return {
      data: rows.map((n) => ({
        id: n.id, title: n.title, body: n.body, category: n.category, priority: n.priority,
        channel: 'in_app', read: !!n.readAt, createdAt: n.createdAt, data: n.data,
      })),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), unread },
    };
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { recipientUserId: userId, readAt: null } });
  }
  async markRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({ where: { id, recipientUserId: userId, readAt: null }, data: { readAt: new Date() } });
    return { success: true };
  }
  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({ where: { recipientUserId: userId, readAt: null }, data: { readAt: new Date() } });
    return { success: true };
  }

  // --- preferences ---
  preferences(userId: string) {
    return this.prisma.notificationPreference.findMany({ where: { userId } });
  }
  async setPreference(userId: string, eventKey: string, channel: Channel, isEnabled: boolean) {
    return this.prisma.notificationPreference.upsert({
      where: { userId_eventKey_channel: { userId, eventKey, channel } },
      update: { isEnabled },
      create: { userId, eventKey, channel, isEnabled },
    });
  }

  // --- templates ---
  templates(orgId: string) {
    return this.prisma.notificationTemplate.findMany({ where: { organizationId: orgId }, orderBy: [{ eventKey: 'asc' }, { channel: 'asc' }] });
  }
  upsertTemplate(orgId: string, dto: { eventKey: string; channel: Channel; locale?: string; subject?: string; body: string; priority?: NotificationPriority }) {
    const locale = dto.locale ?? 'en';
    return this.prisma.notificationTemplate.upsert({
      where: { organizationId_eventKey_channel_locale: { organizationId: orgId, eventKey: dto.eventKey, channel: dto.channel, locale } },
      update: { subject: dto.subject, body: dto.body, priority: dto.priority },
      create: { organizationId: orgId, eventKey: dto.eventKey, channel: dto.channel, locale, subject: dto.subject, body: dto.body, priority: dto.priority ?? 'normal' },
    });
  }
  channelStatus() {
    return Array.from(this.channels.values()).map((c) => ({ channel: c.channel, ready: c.ready }));
  }

  // --- helpers ---
  private async filterByPreferences(userId: string, eventKey: string | undefined, channels: Channel[]): Promise<Channel[]> {
    if (!eventKey) return channels;
    const prefs = await this.prisma.notificationPreference.findMany({ where: { userId, eventKey } });
    const disabled = new Set(prefs.filter((p) => !p.isEnabled).map((p) => p.channel));
    return channels.filter((c) => !disabled.has(c));
  }

  private async render(orgId: string, eventKey: string | undefined, channel: Channel, locale: string, ctx: Record<string, unknown>, opts: NotifyOptions) {
    if (eventKey) {
      const tpl = await this.prisma.notificationTemplate.findFirst({ where: { organizationId: orgId, eventKey, channel, locale, isActive: true } });
      if (tpl) return { title: interpolate(tpl.subject ?? '', ctx), body: interpolate(tpl.body, ctx) };
    }
    return { title: opts.title ?? 'Notification', body: opts.body };
  }
}

/** Minimal {{var}} interpolation — the only "text" in the backend, locale-keyed. */
function interpolate(tpl: string, ctx: Record<string, unknown>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(ctx[k] ?? ''));
}
