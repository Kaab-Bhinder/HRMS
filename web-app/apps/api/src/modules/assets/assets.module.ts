import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';

@Module({ imports: [CustomFieldsModule], controllers: [AssetsController], providers: [AssetsService] })
export class AssetsModule {}
