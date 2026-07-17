import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { BulkImportDto, CreateEmployeeDto, QueryEmployeesDto, UpdateEmployeeDto } from './dto/employee.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @RequirePermissions('employees:read')
  @ApiOperation({ summary: 'List employees — role-scoped (admin/HR: all · head: their team · employee: self)' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryEmployeesDto) {
    return this.service.list(user, query);
  }

  @Post()
  @RequirePermissions('employees:create')
  create(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: CreateEmployeeDto) {
    return this.service.create(orgId, userId, dto);
  }

  @Post('import')
  @RequirePermissions('employees:create')
  @ApiOperation({ summary: 'Bulk import employees (per-row validation, partial success)' })
  bulkImport(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: BulkImportDto) {
    return this.service.bulkImport(orgId, userId, dto.rows);
  }

  @Get(':id')
  @RequirePermissions('employees:read')
  get(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Get(':id/history')
  @RequirePermissions('employees:read')
  history(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.history(orgId, id);
  }

  @Patch(':id')
  @RequirePermissions('employees:update')
  update(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.service.update(orgId, userId, id, dto);
  }

  @Post(':id/restore')
  @RequirePermissions('employees:delete')
  restore(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.restore(orgId, id);
  }

  @Delete(':id')
  @RequirePermissions('employees:delete')
  remove(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(orgId, userId, id);
  }
}
