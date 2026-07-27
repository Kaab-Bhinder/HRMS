import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(private readonly service: ClientsService) {}

  @Get()
  @RequirePermissions('clients:read')
  @ApiOperation({ summary: 'List clients with their serving department' })
  list(@CurrentUser('organizationId') orgId: string) {
    return this.service.list(orgId);
  }

  @Get(':id/performance')
  @RequirePermissions('clients:read')
  @ApiOperation({ summary: "Serving team's live performance for a client (roster, attendance, tasks, reports)" })
  performance(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.performance(orgId, id);
  }

  @Post()
  @RequirePermissions('clients:create')
  create(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: CreateClientDto) {
    return this.service.create(orgId, userId, dto);
  }

  @Patch(':id')
  @RequirePermissions('clients:update')
  update(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.service.update(orgId, userId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('clients:delete')
  remove(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(orgId, userId, id);
  }
}
