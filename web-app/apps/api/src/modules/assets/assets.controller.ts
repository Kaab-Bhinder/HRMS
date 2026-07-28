import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { AssignAssetDto, CreateAssetDto, ReturnAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  @RequirePermissions('assets:read')
  @ApiOperation({ summary: 'Asset registry (filter by status/category/holder/search)' })
  list(
    @CurrentUser('organizationId') orgId: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('employeeId') employeeId?: string,
    @Query('search') search?: string,
  ) {
    return this.service.list(orgId, { status, category, employeeId, search });
  }

  /** Own held assets — self-service, scope-guarded, no assets:read needed
   *  (mirrors how one's own payslip works). */
  @Get('mine')
  @ApiOperation({ summary: 'Assets currently held by the signed-in employee' })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.mine(user.organizationId, user.id);
  }

  @Get(':id/history')
  @RequirePermissions('assets:read')
  @ApiOperation({ summary: 'Full issue/return history of an asset' })
  history(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.history(orgId, id);
  }

  @Post()
  @RequirePermissions('assets:create')
  create(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: CreateAssetDto) {
    return this.service.create(orgId, userId, dto);
  }

  @Post(':id/assign')
  @RequirePermissions('assets:update')
  @ApiOperation({ summary: 'Issue an available asset to an employee' })
  assign(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: AssignAssetDto) {
    return this.service.assign(orgId, userId, id, dto);
  }

  @Post(':id/return')
  @RequirePermissions('assets:update')
  @ApiOperation({ summary: 'Take an assigned asset back (condition + next status)' })
  returnAsset(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: ReturnAssetDto) {
    return this.service.return(orgId, userId, id, dto);
  }

  @Patch(':id')
  @RequirePermissions('assets:update')
  update(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateAssetDto) {
    return this.service.update(orgId, userId, id, dto);
  }

  @Delete(':id')
  @RequirePermissions('assets:delete')
  remove(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.service.remove(orgId, userId, id);
  }
}
