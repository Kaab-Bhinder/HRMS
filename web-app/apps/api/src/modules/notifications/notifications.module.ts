import { Global, Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { InAppChannel, PushChannel, EmailChannel, SmsChannel, WhatsAppChannel } from './channels/channels';
import {
  ChannelRegistry, NOTIFICATION_CHANNEL_REGISTRY, NotificationChannelProvider,
} from './channels/notification-channel.interface';

@Global() // NotificationsService is injectable by any module that needs to notify
@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    InAppChannel,
    PushChannel,
    EmailChannel,
    SmsChannel,
    WhatsAppChannel,
    // Channel registry — add a real provider (FCM/SES/Twilio/WhatsApp) by adding
    // its class here and to the inject list; NotificationsService is untouched.
    {
      provide: NOTIFICATION_CHANNEL_REGISTRY,
      useFactory: (...channels: NotificationChannelProvider[]): ChannelRegistry => {
        const map: ChannelRegistry = new Map();
        for (const c of channels) map.set(c.channel, c);
        return map;
      },
      inject: [InAppChannel, PushChannel, EmailChannel, SmsChannel, WhatsAppChannel],
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
