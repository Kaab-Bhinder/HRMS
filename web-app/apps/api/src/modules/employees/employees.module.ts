import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { WorkEmailService } from './work-email.service';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';

@Module({
  imports: [AuthModule, CustomFieldsModule],
  controllers: [EmployeesController],
  providers: [WorkEmailService, EmployeesService],
  exports: [WorkEmailService, EmployeesService],
})
export class EmployeesModule {}
