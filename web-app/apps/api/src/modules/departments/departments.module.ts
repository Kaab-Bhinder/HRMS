import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({ imports: [EmployeesModule], controllers: [DepartmentsController], providers: [DepartmentsService], exports: [DepartmentsService] })
export class DepartmentsModule {}
