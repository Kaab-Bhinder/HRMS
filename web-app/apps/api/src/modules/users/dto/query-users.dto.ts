import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';
import { UserStatusDto } from './user.dto';

export class QueryUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: UserStatusDto })
  @IsOptional()
  @IsEnum(UserStatusDto)
  status?: UserStatusDto;

  @ApiPropertyOptional({ description: 'Filter by assigned role id' })
  @IsOptional()
  @IsUUID()
  roleId?: string;
}
