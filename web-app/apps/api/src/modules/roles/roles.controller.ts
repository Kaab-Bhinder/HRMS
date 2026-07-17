import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  list(@CurrentUser('organizationId') orgId: string) {
    return this.service.list(orgId);
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  get(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @RequirePermissions('roles:create')
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateRoleDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
