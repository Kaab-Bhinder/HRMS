import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize, ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, IsUUID, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class MemoAttachmentDto {
  @ApiProperty() @IsUUID() fileId!: string;
  @ApiProperty() @IsString() @MaxLength(255) fileName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) mimeType?: string;
  @ApiPropertyOptional() @IsOptional() sizeBytes?: number;
}

export class CreateMemoDto {
  @ApiProperty() @IsString() @MaxLength(200) subject!: string;

  @ApiProperty() @IsString() @MaxLength(20000) body!: string;

  /** Employee ids chosen from the department → person picker. */
  @ApiProperty({ type: [String] })
  @IsArray() @ArrayNotEmpty() @ArrayMaxSize(25) @IsUUID('4', { each: true })
  recipientEmployeeIds!: string[];

  @ApiPropertyOptional({ type: [MemoAttachmentDto] })
  @IsOptional() @IsArray() @ArrayMaxSize(10)
  @ValidateNested({ each: true }) @Type(() => MemoAttachmentDto)
  attachments?: MemoAttachmentDto[];
}

export class QueryMemosDto extends PaginationQueryDto {
  /** inbox = addressed to me, sent = written by me. */
  @ApiPropertyOptional({ enum: ['inbox', 'sent'] })
  @IsOptional() @IsIn(['inbox', 'sent'])
  box?: 'inbox' | 'sent';

  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;

  @ApiPropertyOptional({ description: 'Only memos I have not opened yet' })
  @IsOptional() @IsIn(['true', 'false'])
  unreadOnly?: string;
}

export class DirectoryQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) search?: string;
}
