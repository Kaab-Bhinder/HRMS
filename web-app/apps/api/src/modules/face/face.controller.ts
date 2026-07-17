import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { FaceService } from './face.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class EnrollDto {
  @IsUUID() employeeId!: string;
  @IsString() imageStorageKey!: string;
}

@ApiTags('Face Recognition')
@ApiBearerAuth()
@Controller('face')
export class FaceController {
  constructor(private readonly service: FaceService) {}

  @Post('templates')
  @RequirePermissions('face:create')
  enroll(@CurrentUser('organizationId') orgId: string, @Body() dto: EnrollDto) {
    return this.service.enroll(orgId, dto.employeeId, dto.imageStorageKey);
  }

  @Get('templates/:employeeId')
  @RequirePermissions('face:read')
  templates(@CurrentUser('organizationId') orgId: string, @Param('employeeId') employeeId: string) {
    return this.service.listTemplates(orgId, employeeId);
  }
}
