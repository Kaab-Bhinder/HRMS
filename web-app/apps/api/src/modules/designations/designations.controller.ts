import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DesignationsService } from './designations.service';
import { UpsertDesignationDto } from './dto/designation.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Designations')
@ApiBearerAuth()
@Controller('designations')
export class DesignationsController {
  constructor(private readonly service: DesignationsService) {}

  @Get()
  @RequirePermissions('designations:read')
  list(@CurrentUser('organizationId') orgId: string) {
    return this.service.list(orgId);
  }

  @Post()
  @RequirePermissions('designations:create')
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: UpsertDesignationDto) {
    return this.service.create(orgId, dto);
  }

  @Patch(':id')
  @RequirePermissions('designations:update')
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpsertDesignationDto) {
    return this.service.update(orgId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('designations:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
