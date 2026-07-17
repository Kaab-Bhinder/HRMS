import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScopeService } from './scope.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Access')
@ApiBearerAuth()
@Controller('me')
export class AccessController {
  constructor(private readonly scope: ScopeService) {}

  @Get('scope')
  @ApiOperation({ summary: 'The caller’s role-based view descriptor (admin/hr/dept_head/employee)' })
  myScope(@CurrentUser() user: AuthUser) {
    return this.scope.view(user);
  }
}
