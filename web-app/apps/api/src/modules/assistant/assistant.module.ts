import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { AssistantToolsService } from './assistant-tools.service';
import { OpenAiProvider } from './llm/openai.provider';
import { ClaudeProvider } from './llm/claude.provider';
import { OpenRouterProvider } from './llm/openrouter.provider';
import { LLM_PROVIDERS, type LlmProvider } from './llm/llm-provider.interface';
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
    OpenRouterProvider,
    {
      // Order IS the failover order. ASSISTANT_PROVIDER flips which vendor
      // leads without a code change; unconfigured providers are filtered out
      // at call time, so a missing key degrades instead of breaking.
      provide: LLM_PROVIDERS,
      inject: [OpenAiProvider, ClaudeProvider, OpenRouterProvider],
      useFactory: (openai: OpenAiProvider, claude: ClaudeProvider, openrouter: OpenRouterProvider) => {
        // Whichever vendor is named leads; the rest keep their relative order
        // behind it. OpenRouter is last by default — it is the cheap safety
        // net, not the model you want answering when the others are healthy.
        const byName: Record<string, LlmProvider> = { openai, claude, openrouter };
        const preferred = (process.env.ASSISTANT_PROVIDER || 'openai').toLowerCase();
        const order = ['openai', 'claude', 'openrouter'];
        const chain = [
          ...(byName[preferred] ? [byName[preferred]] : []),
          ...order.filter((n) => n !== preferred).map((n) => byName[n]),
        ];
        return chain;
      },
    },
  ],
  exports: [AssistantService],
})
export class AssistantModule {}
