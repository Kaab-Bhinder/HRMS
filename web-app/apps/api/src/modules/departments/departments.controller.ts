import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';
import { canSeePay, stripPayFields } from '../../common/utils/pay-visibility.util';

@ApiTags('Departments')
@ApiBearerAuth()
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @Get()
  @RequirePermissions('departments:read')
  list(@CurrentUser('organizationId') orgId: string, @Query('search') search?: string) {
    return this.service.list(orgId, search);
  }

  @Get('tree')
  @RequirePermissions('departments:read')
  tree(@CurrentUser('organizationId') orgId: string) {
    return this.service.tree(orgId);
  }

  @Get(':id')
  @RequirePermissions('departments:read')
  get(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Post()
  @RequirePermissions('departments:create')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDepartmentDto) {
    // The inline new-head employee rides the same pay-write gate as
    // POST /employees — without payroll:read its pay fields are dropped.
    if (dto.head?.newEmployee && !canSeePay(user)) stripPayFields(dto.head.newEmployee);
    return this.service.create(user.organizationId, user.id, dto);
  }

  @Patch(':id')
  @RequirePermissions('departments:update')
  update(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.service.update(orgId, userId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('departments:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
