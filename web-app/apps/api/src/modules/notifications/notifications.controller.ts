import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationChannel as Channel, NotificationPriority } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class SetPreferenceDto {
  @IsString() eventKey!: string;
  @IsEnum(Channel) channel!: Channel;
  @IsBoolean() isEnabled!: boolean;
}
class TemplateDto {
  @IsString() eventKey!: string;
  @IsEnum(Channel) channel!: Channel;
  @IsOptional() @IsString() locale?: string;
  @IsOptional() @IsString() subject?: string;
  @IsString() body!: string;
  @IsOptional() @IsEnum(NotificationPriority) priority?: NotificationPriority;
}
class DispatchDto {
  @IsUUID() recipientUserId!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsEnum(NotificationPriority) priority?: NotificationPriority;
  @IsOptional() channels?: Channel[];
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // in-app inbox (self)
  @Get()
  list(@CurrentUser('id') userId: string, @Query('unreadOnly') unreadOnly?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.service.list(userId, { unreadOnly: unreadOnly === 'true', page: page ? +page : 1, limit: limit ? +limit : 20 });
  }

  @Get('unread-count')
  unread(@CurrentUser('id') userId: string) {
    return this.service.unreadCount(userId);
  }

  @Patch('read-all')
  readAll(@CurrentUser('id') userId: string) {
    return this.service.markAllRead(userId);
  }

  @Patch(':id/read')
  read(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.markRead(userId, id);
  }

  // preferences (self)
  @Get('preferences')
  prefs(@CurrentUser('id') userId: string) {
    return this.service.preferences(userId);
  }
  @Patch('preferences')
  setPref(@CurrentUser('id') userId: string, @Body() dto: SetPreferenceDto) {
    return this.service.setPreference(userId, dto.eventKey, dto.channel, dto.isEnabled);
  }

  // channel readiness (which channels are wired)
  @Get('channels')
  channels() {
    return this.service.channelStatus();
  }

  // templates (admin)
  @Get('templates')
  @RequirePermissions('notifications:read')
  templates(@CurrentUser('organizationId') orgId: string) {
    return this.service.templates(orgId);
  }
  @Post('templates')
  @RequirePermissions('notifications:update')
  upsertTemplate(@CurrentUser('organizationId') orgId: string, @Body() dto: TemplateDto) {
    return this.service.upsertTemplate(orgId, dto);
  }

  // dispatch a notification (admin / system)
  @Post('dispatch')
  @RequirePermissions('notifications:create')
  dispatch(@CurrentUser() user: AuthUser, @Body() dto: DispatchDto) {
    return this.service.notify(user.organizationId, dto.recipientUserId, {}, {
      title: dto.title, body: dto.body, category: dto.category, priority: dto.priority,
      channels: dto.channels ?? [Channel.in_app],
    });
  }
}
