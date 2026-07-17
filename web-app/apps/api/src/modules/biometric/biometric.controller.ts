import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BiometricService } from './biometric.service';
import { CreateDeviceDto, IngestDto, MapUserDto, UpdateDeviceDto } from './dto/device.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Biometric Devices')
@ApiBearerAuth()
@Controller('biometric')
export class BiometricController {
  constructor(private readonly service: BiometricService) {}

  @Get('devices')
  @RequirePermissions('biometric:read')
  list(@CurrentUser('organizationId') orgId: string) {
    return this.service.listDevices(orgId);
  }

  @Post('devices')
  @RequirePermissions('biometric:create')
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateDeviceDto) {
    return this.service.createDevice(orgId, dto);
  }

  @Patch('devices/:id')
  @RequirePermissions('biometric:update')
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.service.updateDevice(orgId, id, dto);
  }

  @Delete('devices/:id')
  @RequirePermissions('biometric:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.removeDevice(orgId, id);
  }

  @Post('devices/:id/test')
  @RequirePermissions('biometric:update')
  @ApiOperation({ summary: 'Test connectivity via the vendor adapter' })
  test(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.testConnection(orgId, id);
  }

  @Post('devices/:id/sync')
  @RequirePermissions('biometric:update')
  @ApiOperation({ summary: 'Pull logs from the device and import as attendance punches' })
  sync(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.sync(orgId, id);
  }

  @Get('devices/:id/sync-logs')
  @RequirePermissions('biometric:read')
  syncLogs(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.syncLogs(orgId, id);
  }

  @Get('devices/:id/mappings')
  @RequirePermissions('biometric:read')
  mappings(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.listMappings(orgId, id);
  }

  @Post('devices/:id/mappings')
  @RequirePermissions('biometric:update')
  @ApiOperation({ summary: 'Map a device user id to an employee' })
  map(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: MapUserDto) {
    return this.service.mapUser(orgId, id, dto);
  }

  @Post('devices/:id/ingest')
  @RequirePermissions('biometric:create')
  @ApiOperation({ summary: 'Push-mode ingest: device POSTs its logs here' })
  ingest(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: IngestDto) {
    return this.service.ingest(orgId, id, dto.logs);
  }
}
