import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import {
  AdvanceDecisionDto, CreateTravelDto, DecisionDto, EvidenceDto, PaymentDto, QueryTravelDto,
  RealizationDto, RuleDto, VerifyDto,
} from './dto/travel.dto';

@ApiTags('Business Travel')
@ApiBearerAuth()
@Controller('travel')
export class TravelController {
  constructor(private readonly service: TravelService) {}

  // --- reads. No permission gate: results are role-scoped in the service, so
  // an employee sees their own trips and a head sees their team's.
  @Get()
  @ApiOperation({ summary: 'List travel requests visible to the caller' })
  list(@CurrentUser() user: AuthUser, @Query() q: QueryTravelDto) {
    return this.service.list(user, q);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard tiles: trips, cost, pending approvals and reimbursements' })
  stats(@CurrentUser() user: AuthUser) {
    return this.service.stats(user);
  }

  // --- approval rules (admin). Placed before ':id' routes so "rules" is not
  // swallowed as a request id.
  @Get('rules')
  @RequirePermissions('organizations:update')
  @ApiOperation({ summary: 'List the level-based approval rules' })
  listRules(@CurrentUser('organizationId') orgId: string) {
    return this.service.listRules(orgId);
  }

  @Post('rules')
  @RequirePermissions('organizations:update')
  createRule(@CurrentUser('organizationId') orgId: string, @Body() dto: RuleDto) {
    return this.service.upsertRule(orgId, dto);
  }

  @Patch('rules/:ruleId')
  @RequirePermissions('organizations:update')
  updateRule(@CurrentUser('organizationId') orgId: string, @Param('ruleId') ruleId: string, @Body() dto: RuleDto) {
    return this.service.upsertRule(orgId, dto, ruleId);
  }

  @Delete('rules/:ruleId')
  @RequirePermissions('organizations:update')
  removeRule(@CurrentUser('organizationId') orgId: string, @Param('ruleId') ruleId: string) {
    return this.service.removeRule(orgId, ruleId);
  }

  @Get('rules/preview/:employeeId')
  @RequirePermissions('organizations:update')
  @ApiOperation({ summary: 'Show the chain an employee would actually get' })
  preview(@CurrentUser('organizationId') orgId: string, @Param('employeeId') employeeId: string) {
    return this.service.previewChain(orgId, employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'One request with its activity log, evidence and approval chain' })
  detail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.detail(user, id);
  }

  // --- step 1: request
  @Post()
  @ApiOperation({ summary: 'Create a travel request (draft)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateTravelDto) {
    return this.service.create(user, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit for approval — builds the chain from the employee’s level' })
  submit(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.submit(user, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.cancel(user, id);
  }

  // --- step 2: approvals
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve the current step of the chain' })
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: DecisionDto) {
    return this.service.decide(user, id, dto.stepId, 'approved', dto.comment);
  }

  @Post(':id/reject')
  reject(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: DecisionDto) {
    return this.service.decide(user, id, dto.stepId, 'rejected', dto.comment);
  }

  // --- step 3: advance (finance only)
  @Patch(':id/advance')
  @RequirePermissions('payroll:create')
  @ApiOperation({ summary: 'Finance sets the advance actually released (may reduce each line)' })
  advance(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AdvanceDecisionDto) {
    return this.service.decideAdvance(user, id, dto);
  }

  @Post(':id/advance/pay')
  @RequirePermissions('payroll:create')
  @ApiOperation({ summary: 'Record the advance transfer' })
  payAdvance(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: PaymentDto) {
    return this.service.payAdvance(user, id, dto);
  }

  // --- step 4: realization
  @Post(':id/realization')
  @ApiOperation({ summary: 'File the accountability report (actuals + activity log)' })
  realization(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: RealizationDto) {
    return this.service.submitRealization(user, id, dto);
  }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Attach an uploaded document as evidence' })
  addEvidence(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: EvidenceDto) {
    return this.service.addEvidence(user, id, dto.fileId, dto.caption);
  }

  @Delete(':id/evidence/:evidenceId')
  removeEvidence(@CurrentUser() user: AuthUser, @Param('id') id: string, @Param('evidenceId') evidenceId: string) {
    return this.service.removeEvidence(user, id, evidenceId);
  }

  // --- step 5: verification and settlement (finance only)
  @Post(':id/verify')
  @RequirePermissions('payroll:create')
  @ApiOperation({ summary: 'Verify the report; freezes the settlement balance' })
  verify(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: VerifyDto) {
    return this.service.verify(user, id, dto);
  }

  @Post(':id/settle')
  @RequirePermissions('payroll:create')
  @ApiOperation({ summary: 'Record the settlement transfer and close the trip' })
  settle(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: PaymentDto) {
    return this.service.paySettlement(user, id, dto);
  }
}
