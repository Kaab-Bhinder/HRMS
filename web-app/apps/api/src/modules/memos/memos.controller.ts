import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemosService } from './memos.service';
import { CreateMemoDto, DirectoryQueryDto, QueryMemosDto } from './dto/memo.dto';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * Internal memos — person-to-person across departments. Self-service like
 * `/reporting`: any authenticated user may send and read their own, so there is
 * no permission gate. Visibility is enforced per record instead.
 */
@ApiTags('Memos')
@ApiBearerAuth()
@Controller('memos')
export class MemosController {
  constructor(private readonly service: MemosService) {}

  // Static paths must be declared before ':id', or Nest matches "directory"
  // as a memo id.
  @Get('directory')
  @ApiOperation({ summary: 'Departments, or the people inside one, for the recipient picker' })
  directory(@CurrentUser() user: AuthUser, @Query() query: DirectoryQueryDto) {
    return this.service.directory(user, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread memos addressed to me' })
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.service.unreadCount(user);
  }

  @Get()
  @ApiOperation({ summary: 'List memos — inbox (default) or sent' })
  list(@CurrentUser() user: AuthUser, @Query() query: QueryMemosDto) {
    return this.service.list(user, query);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Send a memo; super admins are copied automatically' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMemoDto) {
    return this.service.create(user, dto);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a memo read for me' })
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.markRead(user, id);
  }
}
