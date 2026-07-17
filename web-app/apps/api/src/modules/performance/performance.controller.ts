import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import {
  CreateCycleDto, CreateGoalDto, CreateReviewDto, QueryGoalsDto, QueryReviewsDto,
  UpdateCycleDto, UpdateGoalDto, UpdateReviewDto,
} from './dto/performance.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Performance')
@ApiBearerAuth()
@Controller('performance')
export class PerformanceController {
  constructor(private readonly service: PerformanceService) {}

  // --- Cycles ---

  @Get('cycles')
  @RequirePermissions('performance:read')
  @ApiOperation({ summary: 'List review cycles' })
  listCycles(@CurrentUser('organizationId') orgId: string) {
    return this.service.listCycles(orgId);
  }

  @Post('cycles')
  @RequirePermissions('performance:create')
  createCycle(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateCycleDto) {
    return this.service.createCycle(orgId, dto);
  }

  @Patch('cycles/:id')
  @RequirePermissions('performance:update')
  updateCycle(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateCycleDto) {
    return this.service.updateCycle(orgId, id, dto);
  }

  // --- Reviews ---

  @Get('reviews')
  @RequirePermissions('performance:read')
  @ApiOperation({ summary: 'List performance reviews (paginated, filterable, searchable by employee name)' })
  listReviews(@CurrentUser('organizationId') orgId: string, @Query() query: QueryReviewsDto) {
    return this.service.listReviews(orgId, query);
  }

  @Post('reviews')
  @RequirePermissions('performance:create')
  createReview(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateReviewDto) {
    return this.service.createReview(orgId, dto);
  }

  @Get('reviews/:id')
  @RequirePermissions('performance:read')
  getReview(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.getReview(orgId, id);
  }

  @Patch('reviews/:id')
  @RequirePermissions('performance:update')
  updateReview(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.service.updateReview(orgId, id, dto);
  }

  @Delete('reviews/:id')
  @RequirePermissions('performance:delete')
  removeReview(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.removeReview(orgId, id);
  }

  // --- Goals ---

  @Get('goals')
  @RequirePermissions('performance:read')
  @ApiOperation({ summary: 'List goals (filterable by status and employee)' })
  listGoals(@CurrentUser('organizationId') orgId: string, @Query() query: QueryGoalsDto) {
    return this.service.listGoals(orgId, query);
  }

  @Post('goals')
  @RequirePermissions('performance:create')
  createGoal(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateGoalDto) {
    return this.service.createGoal(orgId, dto);
  }

  @Patch('goals/:id')
  @RequirePermissions('performance:update')
  updateGoal(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.service.updateGoal(orgId, id, dto);
  }

  @Delete('goals/:id')
  @RequirePermissions('performance:delete')
  removeGoal(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.removeGoal(orgId, id);
  }
}
