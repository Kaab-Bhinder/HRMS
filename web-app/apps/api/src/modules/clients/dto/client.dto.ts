import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ClientStatus } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty() @IsString() @MaxLength(200) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) code?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(150) contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() contactEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) contactPhone?: string;
  @ApiPropertyOptional({ enum: ClientStatus }) @IsOptional() @IsEnum(ClientStatus) status?: ClientStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ description: 'The department (team) serving this client.' })
  @IsOptional() @IsUUID() departmentId?: string;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}
