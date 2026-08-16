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
/**
 * Resend delivers over HTTPS rather than SMTP. On hosts that block or throttle
 * outbound port 587 — and behind the IPv6 problem that broke SMTP on Render —
 * an ordinary HTTPS call is far more reliable, so it is preferred when
 * configured. No SDK: one POST, so there is no dependency to keep current.
 */
class ResendTransport {
  private readonly log = new Logger('ResendTransport');
  constructor(private readonly apiKey: string, private readonly from: string) {}

  async send(to: string, subject: string, text: string, html?: string): Promise<DeliveryResult> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        // Resend requires at least one body field; a bare subject is rejected.
        body: JSON.stringify({ from: this.from, to: [to], subject, text: text || subject, ...(html ? { html } : {}) }),
      });
      const payload = (await res.json().catch(() => null)) as { id?: string; message?: string; name?: string } | null;
      if (!res.ok) {
        // Resend reports a rejected sender or unverified domain in the body,
        // which is the difference between "fix your DNS" and "retry later".
        const reason = payload?.message ?? payload?.name ?? `HTTP ${res.status}`;
        this.log.error(`Resend rejected mail to ${to}: ${reason}`);
        return { status: 'failed', error: reason };
      }
      return { status: 'sent', providerRef: payload?.id };
    } catch (e) {
      this.log.error(`Resend request failed for ${to}: ${(e as Error).message}`);
      return { status: 'failed', error: (e as Error).message };
    }
  }
}

@Injectable()
export class EmailChannel implements NotificationChannelProvider {
  readonly channel = Channel.email;
  private readonly log = new Logger(EmailChannel.name);
  private readonly transport: Transporter | null;
  private readonly resend: ResendTransport | null;
  private readonly from: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    this.from = process.env.MAIL_FROM || process.env.RESEND_FROM || process.env.SMTP_FROM || 'no-reply@localhost';

    const resendKey = process.env.RESEND_API_KEY;
    this.resend = resendKey ? new ResendTransport(resendKey, this.from) : null;
    if (this.resend) this.log.log(`Resend enabled — sending as ${this.from}`);
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
    if (!this.resend && !this.transport) {
      this.log.warn('Neither RESEND_API_KEY nor SMTP_HOST is set — e-mails will be logged, not sent');
    }
  }

  get ready(): boolean {
    return this.resend !== null || this.transport !== null;
  }

  async send(message: OutboundMessage): Promise<DeliveryResult> {
    const to = message.email;
    if (!to) return { status: 'failed', error: 'No e-mail address for this recipient' };

    // Resend wins when both are configured: it is the deliverable path on a
    // verified domain, and SMTP stays available as a fallback for local work.
    if (this.resend) {
      return this.resend.send(to, message.title, message.body ?? '', message.html);
    }

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
/**
 * WhatsApp via Meta's Cloud API (WhatsApp Business Platform).
 *
 * Two rules from Meta shape this code:
 *   1. A message the business STARTS must use a template Meta has approved.
 *      Free text is only allowed inside the 24 hours after the user last wrote
 *      in. Everything this system sends — leave decisions, signature requests —
 *      is business-initiated, so a template is the normal path and plain text
 *      is the fallback that will usually be refused.
 *   2. Numbers go on the wire in E.164 with no '+' and no punctuation.
 */
@Injectable()
export class WhatsAppChannel implements NotificationChannelProvider {
  readonly channel = Channel.whatsapp;
  private readonly log = new Logger(WhatsAppChannel.name);
  private readonly phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
  private readonly token = process.env.WHATSAPP_ACCESS_TOKEN ?? '';
  private readonly version = process.env.WHATSAPP_API_VERSION ?? 'v21.0';
  private readonly defaultLanguage = process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? 'en';

  get ready(): boolean {
    return !!(this.phoneNumberId && this.token);
  }

  async send(message: OutboundMessage): Promise<DeliveryResult> {
    const to = normalizeMsisdn(message.phone);
    if (!to) return { status: 'failed', error: 'No WhatsApp number for this recipient' };

    if (!this.ready) {
      // Same contract as the e-mail channel in development: say what would have
      // gone out rather than failing silently.
      this.log.warn(`[dev] WhatsApp to ${to}: ${message.title} — ${message.body ?? ''}`);
      return { status: 'queued' };
    }

    const body = message.template
      ? {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: message.template.name,
            language: { code: message.template.language ?? this.defaultLanguage },
            ...(message.template.params?.length
              ? {
                  components: [
                    {
                      type: 'body',
                      parameters: message.template.params.map((text) => ({ type: 'text', text })),
                    },
                  ],
                }
              : {}),
          },
        }
      : {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: [message.title, message.body].filter(Boolean).join('\n\n') },
        };

    try {
      const res = await fetch(`https://graph.facebook.com/${this.version}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await res.json().catch(() => null)) as
        | { messages?: { id: string }[]; error?: { message?: string; code?: number } }
        | null;
      if (!res.ok) {
        const reason = payload?.error?.message ?? `HTTP ${res.status}`;
        this.log.error(`WhatsApp to ${to} rejected: ${reason}`);
        return { status: 'failed', error: reason };
      }
      return { status: 'sent', providerRef: payload?.messages?.[0]?.id };
    } catch (e) {
      this.log.error(`WhatsApp request failed for ${to}: ${(e as Error).message}`);
      return { status: 'failed', error: (e as Error).message };
    }
  }
}

/**
 * Meta wants digits only. Indonesian numbers are commonly stored as `08…`
 * locally, which is the same subscriber as `+628…` — sending the leading zero
 * would silently address nobody, so it is converted rather than rejected.
 */
export function normalizeMsisdn(raw?: string, defaultCountry = process.env.DEFAULT_COUNTRY_CODE ?? '62'): string | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('0')) digits = defaultCountry + digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  return /^\d{8,15}$/.test(digits) ? digits : null;
}
