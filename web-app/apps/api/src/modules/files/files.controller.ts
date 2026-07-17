import { Body, Controller, Delete, Get, Param, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { ListFilesQuery, PresignDto, RegisterFileDto, UploadFileDto } from './dto/file.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
  upload(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ) {
    return this.service.upload(orgId, userId, file, dto.ownerType, dto.ownerId, dto.category);
  }

  @Get(':id/download')
  @RequirePermissions('files:read')
  @ApiOperation({ summary: 'Stream a file download' })
  async download(
    @CurrentUser('organizationId') orgId: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { file, bytes } = await this.service.download(orgId, id);
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
  list(@CurrentUser('organizationId') orgId: string, @Query() q: ListFilesQuery) {
    return this.service.listByOwner(orgId, q.ownerType, q.ownerId);
  }

  @Get(':id')
  @RequirePermissions('files:read')
  get(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.get(orgId, id);
  }

  @Delete(':id')
  @RequirePermissions('files:delete')
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.service.remove(orgId, id);
  }
}
