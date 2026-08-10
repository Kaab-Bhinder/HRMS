import { createTransport, type Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel as Channel } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { DeliveryResult, NotificationChannelProvider, OutboundMessage } from './notification-channel.interface';

/** In-app: persists a Notification row the client polls / streams. Live today. */
@Injectable()
export class InAppChannel implements NotificationChannelProvider {
  readonly channel = Channel.in_app;
  readonly ready = true;
  constructor(private readonly prisma: PrismaService) {}

  async send(message: OutboundMessage): Promise<DeliveryResult> {
    const n = await this.prisma.notification.create({
      data: {
        organizationId: message.organizationId,
        recipientUserId: message.recipientUserId,
        title: message.title,
        body: message.body,
        data: (message.data ?? {}) as any,
      },
    });
    return { status: 'delivered', providerRef: n.id };
  }
}

/** Base stub for not-yet-wired channels — records intent, returns queued. */
abstract class StubChannel implements NotificationChannelProvider {
  abstract readonly channel: Channel;
  readonly ready = false;
  async send(_message: OutboundMessage): Promise<DeliveryResult> {
    // Real provider (FCM/SES/Twilio/WhatsApp Business API) plugs in here.
    return { status: 'queued', providerRef: undefined };
  }
}

@Injectable()
export class PushChannel extends StubChannel {
  readonly channel = Channel.push; // Firebase Cloud Messaging
}
/**
 * Real e-mail delivery over SMTP — works with SES, Brevo, Postmark, Gmail, or
 * any provider, so switching vendor is a config change rather than a code one.
 *
 * With no SMTP configured it does NOT silently swallow the message: it logs
 * the full body (including any action link) and reports `queued`, so invites
 * are still usable in development instead of vanishing.
 */
@Injectable()
export class EmailChannel implements NotificationChannelProvider {
  readonly channel = Channel.email;
  private readonly log = new Logger(EmailChannel.name);
  private readonly transport: Transporter | null;
  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    this.from = process.env.SMTP_FROM || 'no-reply@localhost';
    // `family: 4` is honoured by nodemailer at runtime (it is forwarded to
    // net.connect) but missing from its type definitions, hence the widened
    // type rather than a blind cast.
    const smtpOptions: SMTPTransport.Options & { family?: number } = {
      host: host ?? '',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? '' }
        : undefined,
      // Force IPv4. Most container hosts (Render included) have no IPv6
      // egress, but DNS returns Gmail's AAAA record first — so every send
      // died with ENETUNREACH before a packet left the box.
      family: 4,
      // Fail fast rather than holding a request open for minutes when a
      // provider is unreachable; delivery is best-effort anyway.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    };
    this.transport = host ? createTransport(smtpOptions) : null;
    if (!this.transport) this.log.warn('SMTP_HOST not set — e-mails will be logged, not sent');
  }

  get ready(): boolean {
    return this.transport !== null;
  }

  async send(message: OutboundMessage): Promise<DeliveryResult> {
    const to = message.email;
    if (!to) return { status: 'failed', error: 'No e-mail address for this recipient' };

    if (!this.transport) {
      this.log.warn(`[dev] e-mail to ${to}: ${message.title}\n${message.body ?? ''}`);
      return { status: 'queued' };
    }
    try {
      const info = await this.transport.sendMail({
        from: this.from,
        to,
        subject: message.title,
        text: message.body ?? '',
        html: message.html,
      });
      return { status: 'sent', providerRef: info.messageId };
    } catch (e) {
      this.log.error(`e-mail to ${to} failed: ${(e as Error).message}`);
      return { status: 'failed', error: (e as Error).message };
    }
  }
}
@Injectable()
export class SmsChannel extends StubChannel {
  readonly channel = Channel.sms;
}
@Injectable()
export class WhatsAppChannel extends StubChannel {
  readonly channel = Channel.whatsapp; // WhatsApp Business API
}
