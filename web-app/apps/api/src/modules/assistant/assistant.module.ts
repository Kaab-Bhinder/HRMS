import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { OpenAiProvider } from './llm/openai.provider';
import { ClaudeProvider } from './llm/claude.provider';
import { LLM_PROVIDERS } from './llm/llm-provider.interface';
import { EmployeesModule } from '../employees/employees.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { DepartmentsModule } from '../departments/departments.module';
import { LeaveModule } from '../leave/leave.module';

@Module({
  imports: [EmployeesModule, AttendanceModule, DepartmentsModule, LeaveModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    AssistantToolsService,
    OpenAiProvider,
    ClaudeProvider,
    {
      // Order IS the failover order. ASSISTANT_PROVIDER flips which vendor
      // leads without a code change; unconfigured providers are filtered out
      // at call time, so a missing key degrades instead of breaking.
      provide: LLM_PROVIDERS,
      inject: [OpenAiProvider, ClaudeProvider],
      useFactory: (openai: OpenAiProvider, claude: ClaudeProvider) =>
        (process.env.ASSISTANT_PROVIDER || 'openai').toLowerCase() === 'claude'
          ? [claude, openai]
          : [openai, claude],
    },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
