import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { WorkEmailService } from './work-email.service';
import { BulkImportDto, CreateEmployeeDto, QueryEmployeesDto, UpdateEmployeeDto } from './dto/employee.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { canSeePay, stripPayFields } from '../../common/utils/pay-visibility.util';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService,
    private readonly workEmail: WorkEmailService,
  ) {}

  @Get()
  @RequirePermissions('employees:read')
  @ApiOperation({ summary: 'List employees — role-scoped (admin/HR: all · head: their team · employee: self)' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryEmployeesDto) {
    return this.service.list(user, query);
  }

  @Post()
  @RequirePermissions('employees:create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEmployeeDto) {
    // Editing employees and setting pay are separate privileges: without
    // payroll:read the pay fields are silently dropped, mirroring how the
    // serializer hides them on the way out.
    const showPay = canSeePay(user);
    return this.service.create(user.organizationId, user.id, showPay ? dto : stripPayFields(dto), showPay);
  }

  @Post('import')
  @RequirePermissions('employees:create')
  @ApiOperation({ summary: 'Bulk import employees (per-row validation, partial success)' })
  bulkImport(@CurrentUser() user: AuthUser, @Body() dto: BulkImportDto) {
    const rows = canSeePay(user) ? dto.rows : dto.rows.map((r) => stripPayFields(r));
    return this.service.bulkImport(user.organizationId, user.id, rows);
  }


  /** Proposes a free work e-mail for a name, so HR doesn't invent one by hand
   *  and accidentally reuse an address that already belongs to someone. */
  @Get('suggest-email')
  @RequirePermissions('employees:create')
  @ApiOperation({ summary: 'Suggest an available work e-mail from a name' })
  suggestEmail(
    @CurrentUser('organizationId') orgId: string,
    @Query('firstName') firstName = '',
    @Query('lastName') lastName = '',
  ) {
    return this.workEmail.suggest(orgId, firstName, lastName);
  }

  /** Live availability check while HR edits the field by hand. */
  @Get('check-email')
  @RequirePermissions('employees:create')
  @ApiOperation({ summary: 'Is this work e-mail free?' })
  async checkEmail(
    @CurrentUser('organizationId') orgId: string,
    @Query('email') email = '',
    @Query('employeeId') employeeId?: string,
  ) {
    return { available: email ? await this.workEmail.isAvailable(orgId, email, employeeId) : false };
  }

  @Get(':id')
  @RequirePermissions('employees:read')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user.organizationId, id, canSeePay(user));
  }

  @Get(':id/history')
  @RequirePermissions('employees:read')
  history(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.history(orgId, id);
  }

  @Patch(':id')
  @RequirePermissions('employees:update')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const showPay = canSeePay(user);
    return this.service.update(user.organizationId, user.id, id, showPay ? dto : stripPayFields(dto), showPay);
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
