import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payroll')
@ApiBearerAuth()
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  /** Payroll register for a month — one row per in-scope employee. */
  @Get('register')
  @RequirePermissions('attendance:read')
  @ApiOperation({ summary: 'Monthly payroll register (scoped: org / team)' })
  register(@CurrentUser() user: AuthUser, @Query('year') year?: string, @Query('month') month?: string) {
    const { y, m } = resolveMonth(year, month);
    return this.payroll.register(user, y, m);
  }

  /** Detailed payslip for one employee — self-service friendly (scope-guarded). */
  @Get('payslip')
  @ApiOperation({ summary: 'Detailed monthly payslip for an employee (self / team / org)' })
  payslip(
    @CurrentUser() user: AuthUser,
    @Query('employeeId') employeeId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const { y, m } = resolveMonth(year, month);
    return this.payroll.payslip(user, employeeId, y, m);
  }
}

/** Defaults to the current month when year/month are omitted. */
function resolveMonth(year?: string, month?: string) {
  const now = new Date();
  const y = year ? parseInt(year, 10) : now.getUTCFullYear();
  const m = month ? parseInt(month, 10) : now.getUTCMonth() + 1;
  return { y, m };
}
