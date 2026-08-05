import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateSavedReportDto, QuerySavedReportsDto, RunReportQueryDto, UpdateSavedReportDto } from './dto/report.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get()
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'List saved reports (paginated, filter by ?module=)' })
  list(@CurrentUser('organizationId') orgId: string, @Query() query: QuerySavedReportsDto) {
    return this.service.list(orgId, query);
  }

  /** The report catalogue, so the UI never hard-codes report titles again. */
  @Get('catalog')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'List available reports and the parameters each needs' })
  catalog() {
    return this.service.listCatalog();
  }

  @Get('export')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Run and download a report (module + format + filters)' })
  async export(
    @CurrentUser('organizationId') orgId: string,
    @Query() query: RunReportQueryDto,
    @Res() res: Response,
  ) {
    const { filename, contentType, body } = await this.service.run(orgId, query);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(body);
  }

  @Post()
  @RequirePermissions('reports:create')
  create(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSavedReportDto,
  ) {
    return this.service.create(orgId, userId, dto);
  }

  @Patch(':id')
  @RequirePermissions('reports:update')
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateSavedReportDto) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('reports:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
