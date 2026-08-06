import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID,
  MaxLength, Min, ValidateNested,
} from 'class-validator';
import { TransportMode, TravelApprover, TravelStatus, TravelVerification } from '@prisma/client';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

const MAX_IDR = 10_000_000_000;

export class CreateTravelDto {
  /** Omit to file for yourself; HR may file on someone's behalf. */
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;

  @ApiProperty() @IsString() @MaxLength(160) destinationCity!: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clientId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) clientName?: string;
  @ApiProperty() @IsString() @MaxLength(2000) purpose!: string;
  @ApiProperty() @IsDateString() startDate!: string;
  @ApiProperty() @IsDateString() endDate!: string;
  @ApiProperty({ enum: TransportMode }) @IsEnum(TransportMode) transportation!: TransportMode;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hotelNeeded?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) estimatedCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) requestedTransport?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) requestedHotel?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) requestedAllowance?: number;
}

export class UpdateTravelDto extends CreateTravelDto {}

export class QueryTravelDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TravelStatus }) @IsOptional() @IsEnum(TravelStatus) status?: TravelStatus;
  @ApiPropertyOptional() @IsOptional() @IsUUID() employeeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() clientId?: string;
}

export class DecisionDto {
  @ApiProperty() @IsUUID() stepId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) comment?: string;
}

/** Finance may release less than was asked for, per line. */
export class AdvanceDecisionDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) transport?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) hotel?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) allowance?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class ActivityDto {
  @ApiProperty() @IsDateString() date!: string;
  @ApiProperty({ example: '08:00' }) @IsString() @MaxLength(20) time!: string;
  @ApiProperty() @IsString() @MaxLength(500) description!: string;
}

export class RealizationDto {
  @ApiPropertyOptional() @IsOptional() @IsDateString() actualDepartureDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() actualReturnDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) transportUsed?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) hotelUsed?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) actualTransport?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) actualHotel?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) actualAllowance?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) note?: string;

  @ApiPropertyOptional({ type: [ActivityDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ActivityDto)
  activities?: ActivityDto[];
}

export class VerifyDto {
  @ApiProperty({ enum: TravelVerification }) @IsEnum(TravelVerification) result!: TravelVerification;
  /** Required when partially approving — how much is actually allowed. */
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Type(() => Number) verifiedAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class PaymentDto {
  @ApiPropertyOptional({ description: 'Defaults to now.' }) @IsOptional() @IsDateString() paidAt?: string;
  @ApiPropertyOptional({ description: 'Bank transfer / voucher reference.' })
  @IsOptional() @IsString() @MaxLength(120) reference?: string;
}

export class EvidenceDto {
  @ApiProperty({ description: 'Id of a file already uploaded via /files/upload.' })
  @IsUUID() fileId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) caption?: string;
}

/** One row of the level-based approval matrix. */
export class RuleDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;
  @ApiProperty({ description: 'Lowest designation level this rule covers.' })
  @IsNumber() @Min(0) @Type(() => Number) minLevel!: number;
  @ApiProperty({ description: 'Highest designation level this rule covers.' })
  @IsNumber() @Min(0) @Type(() => Number) maxLevel!: number;
  @ApiProperty({ enum: TravelApprover, isArray: true })
  @IsArray() @IsEnum(TravelApprover, { each: true }) steps!: TravelApprover[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
