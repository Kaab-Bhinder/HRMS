import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';

@Module({
  imports: [AuthModule, CustomFieldsModule],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
