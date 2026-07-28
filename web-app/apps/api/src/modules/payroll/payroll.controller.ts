import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PayrollService } from './payroll.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class FinalizePayrollDto {
  @Type(() => Number) @IsInt() @Min(2000) @Max(2100) year!: number;
  @Type(() => Number) @IsInt() @Min(1) @Max(12) month!: number;
}

@ApiTags('Payroll')
@ApiBearerAuth()
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payroll: PayrollService) {}

  /** Payroll register for a month — one row per in-scope employee. */
  @Get('register')
  @RequirePermissions('payroll:read')
  @ApiOperation({ summary: 'Monthly payroll register (scoped: org / team)' })
  register(@CurrentUser() user: AuthUser, @Query('year') year?: string, @Query('month') month?: string) {
    const { y, m } = resolveMonth(year, month);
    return this.payroll.register(user, y, m);
  }

  /** Detailed payslip for one employee. Deliberately NOT permission-gated:
   *  one's own payslip is self-service (mobile), enforced by the scope check in
   *  the service — payroll:read is only required to open someone else's. */
  @Get('payslip')
  @ApiOperation({ summary: 'Detailed monthly payslip (own: always · others: payroll:read)' })
  payslip(
    @CurrentUser() user: AuthUser,
    @Query('employeeId') employeeId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    // Guard the param explicitly: Prisma treats `id: undefined` as "no filter",
    // so letting it through would resolve to an arbitrary employee's slip.
    if (!employeeId) throw new BadRequestException('employeeId is required');
    const { y, m } = resolveMonth(year, month);
    return this.payroll.payslip(user, employeeId, y, m);
  }

  /** Finalize a month — snapshots each in-scope employee's pay into an immutable
   *  payslip. Idempotent; already-finalized employees are left untouched. */
  @Post('finalize')
  @RequirePermissions('payroll:create')
  @ApiOperation({ summary: 'Finalize (lock) payroll for a month' })
  finalize(@CurrentUser() user: AuthUser, @Body() dto: FinalizePayrollDto) {
    return this.payroll.finalize(user, dto.year, dto.month);
  }
}

/** Defaults to the current month when year/month are omitted. */
function resolveMonth(year?: string, month?: string) {
  const now = new Date();
  const y = year ? parseInt(year, 10) : now.getUTCFullYear();
  const m = month ? parseInt(month, 10) : now.getUTCMonth() + 1;
  return { y, m };
}
