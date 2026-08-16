import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize, ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsOptional, IsString, IsUUID, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CreateTemplateDto {
  @ApiProperty() @IsString() @MaxLength(150) name!: string;
  @ApiProperty({ description: 'Supports {{company}}, {{date}} and {{title}}' })
  @IsString() @MaxLength(50000) body!: string;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50000) body?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class SignerInputDto {
  /** An employee, or a name and number typed in for someone outside the company. */
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(255) email?: string;
}

export class CreateAgreementDto {
  @ApiProperty() @IsString() @MaxLength(200) title!: string;

  @ApiPropertyOptional({ description: 'Omit when templateId is given' })
  @IsOptional() @IsString() @MaxLength(50000) body?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID() templateId?: string;

  @ApiProperty({ type: [SignerInputDto] })
  @IsArray() @ArrayNotEmpty() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => SignerInputDto)
  signers!: SignerInputDto[];

  @ApiPropertyOptional({ description: 'ISO date after which the agreement can no longer be signed' })
  @IsOptional() @IsString() expiresAt?: string;
}

export class QueryAgreementsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['draft', 'sent', 'partially_signed', 'completed', 'declined', 'cancelled'] })
  @IsOptional()
  @IsIn(['draft', 'sent', 'partially_signed', 'completed', 'declined', 'cancelled'])
  status?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}

export class SignDto {
  /** Transparent PNG data URL produced by the capture screen. */
  @ApiProperty() @IsString() @MaxLength(700_000) signaturePng!: string;
}

export class DeclineDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) reason?: string;
}
