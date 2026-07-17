import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportExportService } from './report-export.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportExportService],
})
export class ReportsModule {}
