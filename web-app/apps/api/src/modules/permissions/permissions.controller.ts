import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  // Guarded by roles:read — anyone who can view roles needs the catalog to build them.
  @Get()
  @RequirePermissions('roles:read')
  list() {
    return this.service.list();
  }
}
