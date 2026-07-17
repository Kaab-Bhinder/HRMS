import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import {
  CreateLeaveRequestDto, CreateLeaveTypeDto, DecisionDto, QueryLeaveRequestsDto, UpdateLeaveTypeDto,
} from './dto/leave.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leave')
@ApiBearerAuth()
@Controller('leave')
export class LeaveController {
  constructor(private readonly service: LeaveService) {}

  // --- Leave types ---

  @Get('types')
  @RequirePermissions('leave:read')
  @ApiOperation({ summary: 'List leave types' })
  listTypes(@CurrentUser('organizationId') orgId: string) {
    return this.service.listTypes(orgId);
  }

  @Post('types')
  @RequirePermissions('leave:create')
  createType(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateLeaveTypeDto) {
    return this.service.createType(orgId, dto);
  }

  @Patch('types/:id')
  @RequirePermissions('leave:update')
  updateType(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) {
    return this.service.updateType(orgId, id, dto);
  }

  @Delete('types/:id')
  @RequirePermissions('leave:delete')
  removeType(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.removeType(orgId, id);
  }

  // --- Balances ---

  @Get('balances/:employeeId')
  @RequirePermissions('leave:read')
  @ApiOperation({ summary: 'Leave balances for an employee (current year)' })
  balances(@CurrentUser('organizationId') orgId: string, @Param('employeeId') employeeId: string) {
    return this.service.balances(orgId, employeeId);
  }

  // --- Requests ---

  @Get('requests')
  @RequirePermissions('leave:read')
  @ApiOperation({ summary: 'List leave requests (paginated, filterable, searchable)' })
  listRequests(@CurrentUser() user: AuthUser, @Query() query: QueryLeaveRequestsDto) {
    return this.service.listRequests(user, query);
  }

  @Post('requests')
  @RequirePermissions('leave:create')
  createRequest(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: CreateLeaveRequestDto) {
    return this.service.createRequest(orgId, userId, dto);
  }

  @Post('requests/:id/approve')
  @RequirePermissions('leave:update')
  approve(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: DecisionDto) {
    return this.service.approve(orgId, id, dto.comment);
  }

  @Post('requests/:id/reject')
  @RequirePermissions('leave:update')
  reject(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: DecisionDto) {
    return this.service.reject(orgId, id, dto.comment);
  }

  @Post('requests/:id/cancel')
  @RequirePermissions('leave:read')
  cancel(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.cancel(orgId, userId, id);
  }
}
