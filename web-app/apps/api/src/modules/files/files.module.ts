import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { StorageService } from './storage.service';

@Module({
  controllers: [FilesController],
  providers: [FilesService, StorageService],
  exports: [FilesService, StorageService],
})
export class FilesModule {}
