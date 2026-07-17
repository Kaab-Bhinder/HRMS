import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn, Max, Min } from 'class-validator';

/** Base query params for every list endpoint. Modules extend with their own filters. */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function paginated<T>(data: T[], total: number, page: number, limit: number): Paginated<T> {
  return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

/** Builds a Prisma orderBy from a whitelist of sortable columns. */
export function buildOrderBy(sort: string | undefined, order: 'asc' | 'desc', allowed: string[], fallback: Record<string, 'asc' | 'desc'>) {
  if (sort && allowed.includes(sort)) return { [sort]: order };
  return fallback;
}
