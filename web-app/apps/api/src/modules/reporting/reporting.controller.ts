import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportingService } from './reporting.service';
import { CreateReportDto, QueryReportsDto, ReviewReportDto } from './dto/report.dto';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

/** Periodic work reports submitted up the chain. Distinct from the analytics
 *  `/reports` module — this is `/reporting` (report submissions & reviews). */
@ApiTags('Reporting')
@ApiBearerAuth()
@Controller('reporting')
export class ReportingController {
  constructor(private readonly service: ReportingService) {}

  @Get()
  @ApiOperation({ summary: 'List reports — reviewers (HR/admin) see all; others see their own' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryReportsDto) {
    return this.service.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Submit a report (self-service; any authenticated user)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReportDto) {
    return this.service.create(user, dto);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Mark a report reviewed/acknowledged (HR & super admin only)' })
  review(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ReviewReportDto) {
    return this.service.review(user, id, dto);
  }
}
