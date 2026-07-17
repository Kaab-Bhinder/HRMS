import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Audit & Activity')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('logs')
  @RequirePermissions('audit:read')
  logs(
    @CurrentUser('organizationId') orgId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('actorUserId') actorUserId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.list(orgId, { page: page ? +page : 1, limit: limit ? +limit : 20, search, action, entityType, actorUserId, from, to });
  }

  @Get('activity')
  @RequirePermissions('audit:read')
  activity(@CurrentUser('organizationId') orgId: string, @Query('limit') limit?: string) {
    return this.service.activity(orgId, limit ? +limit : 15);
  }
}
