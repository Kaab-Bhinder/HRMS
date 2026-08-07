import { Module } from '@nestjs/common';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { ReportingLineService } from './reporting-line.service';
import { EmployeesModule } from '../employees/employees.module';

@Module({ imports: [EmployeesModule], controllers: [DepartmentsController], providers: [DepartmentsService, ReportingLineService], exports: [DepartmentsService, ReportingLineService] })
export class DepartmentsModule {}
