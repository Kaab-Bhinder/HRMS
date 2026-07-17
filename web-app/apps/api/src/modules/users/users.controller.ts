import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SessionsService } from '../auth/sessions.service';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto/user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly service: UsersService,
    private readonly sessions: SessionsService,
  ) {}

  @Get()
  @RequirePermissions('users:read')
  list(@CurrentUser('organizationId') orgId: string, @Query() q: QueryUsersDto) {
    return this.service.list(orgId, q);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  get(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @RequirePermissions('users:create')
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateUserDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  update(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') actingUserId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(orgId, actingUserId, id, dto);
  }

  @Post(':id/reset-password')
  @RequirePermissions('users:update')
  resetPassword(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.service.resetPassword(orgId, id, dto.password);
  }

  @Get(':id/sessions')
  @RequirePermissions('users:read')
  async listSessions(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    await this.sessions.assertUserInOrg(orgId, id);
    return this.sessions.list(id);
  }

  @Delete(':id/sessions')
  @RequirePermissions('users:update')
  async revokeSessions(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    await this.sessions.assertUserInOrg(orgId, id);
    return this.sessions.revokeAll(id);
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  remove(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') actingUserId: string, @Param('id') id: string) {
    return this.service.remove(orgId, actingUserId, id);
  }
}
