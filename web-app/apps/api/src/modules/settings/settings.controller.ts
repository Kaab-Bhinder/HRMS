import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/setting.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  @RequirePermissions('settings:read')
  getAll(@CurrentUser('organizationId') orgId: string) {
    return this.service.getAll(orgId);
  }

  @Get(':section')
  @RequirePermissions('settings:read')
  getSection(@CurrentUser('organizationId') orgId: string, @Param('section') section: string) {
    return this.service.getSection(orgId, section);
  }

  @Put(':section')
  @RequirePermissions('settings:update')
  putSection(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('section') section: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.service.putSection(orgId, section, dto.value, userId);
  }

  @Patch(':section')
  @RequirePermissions('settings:update')
  patchSection(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Param('section') section: string,
    @Body() dto: UpdateSettingDto,
  ) {
    return this.service.patchSection(orgId, section, dto.value, userId);
  }
}
