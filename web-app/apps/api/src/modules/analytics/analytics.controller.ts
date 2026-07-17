import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Dashboard overview (KPIs + charts, aggregates only, filterable)' })
  overview(@CurrentUser('organizationId') orgId: string, @Query() query: AnalyticsQueryDto) {
    return this.service.overview(orgId, query);
  }

  @Get('attendance')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Attendance status breakdown for a date range' })
  attendance(@CurrentUser('organizationId') orgId: string, @Query() query: AnalyticsQueryDto) {
    return this.service.attendance(orgId, query);
  }

  @Get('departments')
  @RequirePermissions('analytics:read')
  @ApiOperation({ summary: 'Per-department headcount and present percentage' })
  departments(@CurrentUser('organizationId') orgId: string, @Query() query: AnalyticsQueryDto) {
    return this.service.departments(orgId, query);
  }
}
