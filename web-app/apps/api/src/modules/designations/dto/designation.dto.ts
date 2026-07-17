import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpsertDesignationDto {
  @ApiProperty()
  @IsString()
  @MaxLength(150)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
