import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export const OWNER_TYPES = ['employee', 'department', 'task', 'report', 'document', 'organization'] as const;

export class UploadFileDto {
  @ApiProperty({ enum: OWNER_TYPES }) @IsIn(OWNER_TYPES as unknown as string[]) ownerType!: string;
  @ApiProperty() @IsUUID() ownerId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) category?: string;
}

export class PresignDto {
  @ApiProperty() @IsString() @MaxLength(255) fileName!: string;
  @ApiProperty() @IsString() mimeType!: string;
  @ApiProperty({ enum: OWNER_TYPES }) @IsIn(OWNER_TYPES as unknown as string[]) ownerType!: string;
  @ApiProperty() @IsUUID() ownerId!: string;
}

export class RegisterFileDto {
  @ApiProperty({ enum: OWNER_TYPES }) @IsIn(OWNER_TYPES as unknown as string[]) ownerType!: string;
  @ApiProperty() @IsUUID() ownerId!: string;
  @ApiProperty() @IsString() @MaxLength(255) fileName!: string;
  @ApiProperty() @IsString() mimeType!: string;
  @ApiProperty() @IsInt() @Min(1) @Max(15 * 1024 * 1024) sizeBytes!: number;
  @ApiProperty() @IsString() storageKey!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() checksumSha256?: string;
}

export class ListFilesQuery {
  @ApiProperty({ enum: OWNER_TYPES }) @IsIn(OWNER_TYPES as unknown as string[]) ownerType!: string;
  @ApiProperty() @IsUUID() ownerId!: string;
}
