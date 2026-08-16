import { NotificationChannel as Channel } from '@prisma/client';

export interface OutboundMessage {
  recipientUserId: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  organizationId: string;
  /** Destination for off-app channels. E-mail cannot be delivered without it. */
  email?: string;
  /** Destination for SMS and WhatsApp, in E.164 (+62…). */
  phone?: string;
  /** Optional rich body; channels that can't render it fall back to `body`. */
  html?: string;
  /**
   * Pre-approved template to use for channels that require one. WhatsApp will
   * not deliver business-initiated free text outside a 24-hour reply window, so
   * anything the system starts must name a template Meta has approved.
   */
  template?: { name: string; language?: string; params?: string[] };
}

export interface DeliveryResult {
  status: 'sent' | 'delivered' | 'failed' | 'queued';
  providerRef?: string;
  error?: string;
}

/**
 * Delivery channel strategy — one implementation per channel. In-app is live;
 * FCM push, email, SMS, WhatsApp implement the same interface and register in
 * the channel registry. The core NotificationService never changes.
 */
export interface NotificationChannelProvider {
  readonly channel: Channel;
  readonly ready: boolean; // false = configured stub, not yet wired to a real provider
  send(message: OutboundMessage): Promise<DeliveryResult>;
}

export const NOTIFICATION_CHANNEL_REGISTRY = Symbol('NOTIFICATION_CHANNEL_REGISTRY');
export type ChannelRegistry = Map<Channel, NotificationChannelProvider>;
