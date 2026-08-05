import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssistantService } from './assistant.service';
import { CurrentUser, AuthUser } from '../../common/decorators/current-user.decorator';

class ChatTurnDto {
  @IsIn(['user', 'assistant']) role!: 'user' | 'assistant';
  @IsString() @MaxLength(8000) content!: string;
}

class AskDto {
  @IsString() @MaxLength(2000) question!: string;

  @IsOptional() @IsArray() @ArrayMaxSize(20)
  @ValidateNested({ each: true }) @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];
}

@ApiTags('Assistant')
@ApiBearerAuth()
@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  /** Lets the UI hide the assistant entirely when no provider is configured. */
  @Get('status')
  @ApiOperation({ summary: 'Whether the assistant is configured and usable' })
  status() {
    return { available: this.assistant.available };
  }

  /**
   * Ask a question. No permission decorator by design: the assistant is
   * available to every signed-in user, and each tool is scoped to that user, so
   * what it can answer already varies correctly by role.
   */
  @Post('chat')
  @ApiOperation({ summary: 'Ask the assistant a question about the workspace' })
  chat(@CurrentUser() user: AuthUser, @Body() dto: AskDto) {
    return this.assistant.ask(user, dto.question, dto.history ?? []);
  }
}
