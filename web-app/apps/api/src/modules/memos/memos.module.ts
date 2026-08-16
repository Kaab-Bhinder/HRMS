import { Module } from '@nestjs/common';
import { MemosController } from './memos.controller';
import { MemosService } from './memos.service';

// NotificationsModule is @Global, so nothing needs importing here.
@Module({ controllers: [MemosController], providers: [MemosService], exports: [MemosService] })
export class MemosModule {}
