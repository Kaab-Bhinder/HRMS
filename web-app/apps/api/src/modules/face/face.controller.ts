import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from '../files/storage.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { FaceService } from './face.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class EnrollDto {
  @IsUUID() employeeId!: string;
  @IsOptional() @IsString() imageStorageKey?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(8) @IsString({ each: true }) imageStorageKeys?: string[];
}

class SelfEnrollDto {
  @IsArray() @ArrayMinSize(3) @ArrayMaxSize(8) @IsString({ each: true }) imageStorageKeys!: string[];
}

@ApiTags('Face Recognition')
@ApiBearerAuth()
@Controller('face')
export class FaceController {
  constructor(
    private readonly service: FaceService,
    private readonly storage: StorageService,
  ) {}

  /** HR (re-)enrollment — single frame or a multi-pose set. */
  @Post('templates')
  @RequirePermissions('face:create')
  enroll(@CurrentUser('organizationId') orgId: string, @Body() dto: EnrollDto) {
    const keys = dto.imageStorageKeys ?? (dto.imageStorageKey ? [dto.imageStorageKey] : []);
    return this.service.enrollMany(orgId, dto.employeeId, keys);
  }

  /** First-login Face ID setup from the mobile app. Identity-scoped, no
   *  permission needed — and refused once templates exist (HR re-enrolls). */
  @Post('enroll-self')
  @ApiOperation({ summary: 'Multi-pose self-enrollment (first time only; min 3 frames)' })
  selfEnroll(@CurrentUser() user: AuthUser, @Body() dto: SelfEnrollDto) {
    return this.service.selfEnroll(user.organizationId, user.id, dto.imageStorageKeys);
  }

  /** Own reference photo — shown beside the check-in selfie in the app. */
  @Get('my-base-photo')
  @ApiOperation({ summary: 'Stream the signed-in employee\'s enrollment photo' })
  async myBasePhoto(@CurrentUser() user: AuthUser, @Res() res: Response) {
    const key = await this.service.myBasePhotoKey(user.organizationId, user.id);
    const bytes = await this.storage.read(key);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(bytes);
  }

  /** Enrollment gate for the mobile app. */
  @Get('my-status')
  myStatus(@CurrentUser() user: AuthUser) {
    return this.service.myStatus(user.organizationId, user.id);
  }

  @Get('templates/:employeeId')
  @RequirePermissions('face:read')
  templates(@CurrentUser('organizationId') orgId: string, @Param('employeeId') employeeId: string) {
    return this.service.listTemplates(orgId, employeeId);
  }
}
