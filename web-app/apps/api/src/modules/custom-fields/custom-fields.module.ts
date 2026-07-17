import { Module } from '@nestjs/common';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldValidatorService } from './custom-field-validator.service';

@Module({
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService, CustomFieldValidatorService],
  exports: [CustomFieldValidatorService],
})
export class CustomFieldsModule {}
