import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  AssignTaskDto, CreateCommentDto, CreateTaskDto, QueryTasksDto, UpdateTaskDto, UpdateTaskStatusDto,
  SubmitTaskDto,
} from './dto/task.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'List tasks — role-scoped (admin/HR: all · head: team · employee: assigned)' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryTasksDto) {
    return this.service.list(user, query);
  }

  @Get('board')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Non-deleted tasks (role-scoped; frontend groups by status)' })
  board(@CurrentUser() user: AuthUser) {
    return this.service.board(user);
  }

  @Get('stats')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Task counts per status + total (role-scoped)' })
  stats(@CurrentUser() user: AuthUser) {
    return this.service.stats(user);
  }

  @Post()
  @RequirePermissions('tasks:create')
  create(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: CreateTaskDto) {
    return this.service.create(orgId, userId, dto);
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  get(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Patch(':id')
  @RequirePermissions('tasks:update')
  update(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(orgId, userId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
  remove(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(orgId, userId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status (assignee mark-complete for mobile; admins update any)' })
  updateStatus(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.service.updateStatus(user.organizationId, user, id, dto);
  }

  @Post(':id/assign')
  @RequirePermissions('tasks:update')
  assign(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.service.assign(orgId, userId, id, dto);
  }

  @Delete(':id/assign/:employeeId')
  @RequirePermissions('tasks:update')
  unassign(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Param('employeeId') employeeId: string) {
    return this.service.unassign(orgId, id, employeeId);
  }

  @Get(':id/comments')
  @RequirePermissions('tasks:read')
  listComments(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.listComments(orgId, id);
  }

  @Post(':id/comments')
  @RequirePermissions('tasks:update')
  addComment(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    return this.service.addComment(orgId, userId, id, dto);
  }

  @Post(':id/submit')
  @RequirePermissions('tasks:update')
  @ApiOperation({ summary: 'Report back on an assigned task (note + optional completion)' })
  submit(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SubmitTaskDto) {
    return this.service.submit(user.organizationId, user, id, dto);
  }

  @Get(':id/activity')
  @RequirePermissions('tasks:read')
  activity(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.listActivity(orgId, id);
  }
}
