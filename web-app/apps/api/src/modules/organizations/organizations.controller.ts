import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateLocationDto, UpdateLocationDto, UpdateOrganizationDto } from './dto/organization.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organization')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get('current')
  @RequirePermissions('organizations:read')
  current(@CurrentUser('organizationId') orgId: string) {
    return this.service.current(orgId);
  }

  @Patch('current')
  @RequirePermissions('organizations:update')
  update(@CurrentUser('organizationId') orgId: string, @Body() dto: UpdateOrganizationDto) {
    return this.service.update(orgId, dto);
  }

  @Get('locations')
  @RequirePermissions('organizations:read')
  locations(@CurrentUser('organizationId') orgId: string) {
    return this.service.listLocations(orgId);
  }

  @Post('locations')
  @RequirePermissions('organizations:update')
  createLocation(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateLocationDto) {
    return this.service.createLocation(orgId, dto);
  }

  @Patch('locations/:id')
  @RequirePermissions('organizations:update')
  updateLocation(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.service.updateLocation(orgId, id, dto);
  }

  @Delete('locations/:id')
  @RequirePermissions('organizations:update')
  removeLocation(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.removeLocation(orgId, id);
  }
}
