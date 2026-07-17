import { Injectable } from '@nestjs/common';
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
@Injectable()
export class EmailChannel extends StubChannel {
  readonly channel = Channel.email; // AWS SES / SMTP
}
@Injectable()
export class SmsChannel extends StubChannel {
  readonly channel = Channel.sms;
}
@Injectable()
export class WhatsAppChannel extends StubChannel {
  readonly channel = Channel.whatsapp; // WhatsApp Business API
}
