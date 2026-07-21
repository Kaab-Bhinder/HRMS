import { Body, Controller, Delete, Get, Param, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { ListFilesQuery, PresignDto, RegisterFileDto, UploadFileDto } from './dto/file.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

const MAX_UPLOAD = 15 * 1024 * 1024;

@ApiTags('Files & Documents')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly service: FilesService) {}

  @Post('upload')
  @RequirePermissions('files:create')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file for an owner (multipart; e.g. a task or report attachment)' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD } }))
  async upload(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    // Employees may attach files to their own tasks/records only.
    await this.service.assertOwnerAccess(user, dto.ownerType, dto.ownerId);
    return this.service.upload(user.organizationId, user.id, file, dto.ownerType, dto.ownerId, dto.category);
  }

  @Get(':id/download')
  @RequirePermissions('files:read')
  @ApiOperation({ summary: 'Stream a file download' })
  async download(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    await this.service.assertFileAccess(user, id);
    const { file, bytes } = await this.service.download(user.organizationId, id);
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    });
    return new StreamableFile(bytes);
  }

  @Post('presign')
  @RequirePermissions('files:create')
  @ApiOperation({ summary: 'Get a presigned upload URL (validates MIME)' })
  presign(@CurrentUser('organizationId') orgId: string, @Body() dto: PresignDto) {
    return this.service.presign(orgId, dto);
  }

  @Post()
  @RequirePermissions('files:create')
  @ApiOperation({ summary: 'Register uploaded file metadata (e.g. an employee document)' })
  register(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: RegisterFileDto) {
    return this.service.register(orgId, userId, dto);
  }

  @Get()
  @RequirePermissions('files:read')
  @ApiOperation({ summary: 'List files for an owner (e.g. ownerType=employee&ownerId=...)' })
  async list(@CurrentUser() user: AuthUser, @Query() q: ListFilesQuery) {
    await this.service.assertOwnerAccess(user, q.ownerType, q.ownerId);
    return this.service.listByOwner(user.organizationId, q.ownerType, q.ownerId);
  }

  @Get(':id')
  @RequirePermissions('files:read')
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    await this.service.assertFileAccess(user, id);
    return this.service.get(user.organizationId, id);
  }

  @Delete(':id')
  @RequirePermissions('files:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
