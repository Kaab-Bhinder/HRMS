import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { AssistantToolsService, BoundTool } from './assistant-tools.service';
import { systemPrompt } from './assistant.prompt';
import { ChatTurn, LLM_PROVIDERS, LlmProvider, LlmReply, ToolSpec, isRetryableLlmError } from './llm/llm-provider.interface';

/** One message as the client sends/receives it. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantAnswer {
  reply: string;
  /** Which vendor answered — surfaced so a failover is visible, not silent. */
  provider: string;
  /** Tool names actually executed, for transparency and debugging. */
  toolsUsed: string[];
}

/** Hard stop on the tool loop: a confused model must not bill forever. */
const MAX_TOOL_ROUNDS = 5;
/** Cap on history replayed to the model, in turns. */
const MAX_HISTORY = 12;

@Injectable()
export class AssistantService {
  private readonly log = new Logger(AssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tools: AssistantToolsService,
    @Inject(LLM_PROVIDERS) private readonly providers: LlmProvider[],
  ) {}

  /** True when at least one vendor has an API key — the UI hides the assistant otherwise. */
  get available(): boolean {
    return this.providers.some((p) => p.ready);
  }

  async ask(user: AuthUser, question: string, history: ChatMessage[] = []): Promise<AssistantAnswer> {
    const ready = this.providers.filter((p) => p.ready);
    if (!ready.length) {
      throw new ServiceUnavailableException('The assistant is not configured. Add an OpenAI or Anthropic API key.');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true },
    });
    const bound = this.tools.forUser(user);
    const specs: ToolSpec[] = bound.map((t) => t.spec);
    const byName = new Map<string, BoundTool>(bound.map((t) => [t.spec.name, t]));
    const system = systemPrompt(org?.name ?? 'this organisation', user.fullName, this.roleSummary(user));

    const turns: ChatTurn[] = [
      ...history.slice(-MAX_HISTORY).map((m): ChatTurn => ({ role: m.role, content: m.content })),
      { role: 'user', content: question },
    ];

    const toolsUsed: string[] = [];
    let provider = ready[0].name;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const reply = await this.completeWithFailover(ready, system, turns, specs);
      provider = reply.provider;

      if (!reply.toolCalls.length) {
        return { reply: reply.text.trim() || 'I could not find an answer to that.', provider, toolsUsed };
      }

      turns.push({ role: 'assistant', content: reply.text, toolCalls: reply.toolCalls });

      // Run the requested tools. A tool that throws returns its error to the
      // model as a result — it can then explain or try another route, which is
      // far better than collapsing the whole conversation.
      for (const call of reply.toolCalls) {
        const tool = byName.get(call.name);
        let out: unknown;
        if (!tool) {
          out = { error: `Unknown tool "${call.name}".` };
        } else {
          try {
            out = await tool.run(call.arguments);
            toolsUsed.push(call.name);
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Tool failed';
            this.log.warn(`tool ${call.name} failed: ${msg}`);
            out = { error: msg };
          }
        }
        turns.push({ role: 'tool', toolCallId: call.id, name: call.name, content: JSON.stringify(out) });
      }
    }

    // Ran out of rounds — answer from what we have rather than looping.
    const final = await this.completeWithFailover(ready, system, turns, []);
    return {
      reply: final.text.trim() || 'I gathered some data but could not finish the answer. Try narrowing the question.',
      provider: final.provider,
      toolsUsed,
    };
  }

  /**
   * Try each configured provider in order. Fails over only on transient errors
   * (down / overloaded / rate-limited / timed out) — a malformed request would
   * fail identically on the next vendor and should surface immediately.
   */
  private async completeWithFailover(
    providers: LlmProvider[],
    system: string,
    turns: ChatTurn[],
    specs: ToolSpec[],
  ): Promise<LlmReply> {
    let lastErr: unknown;
    for (const p of providers) {
      try {
        return await p.complete(system, turns, specs);
      } catch (err) {
        lastErr = err;
        if (!isRetryableLlmError(err)) throw err;
        this.log.warn(`${p.name} unavailable (${(err as Error)?.message}); trying next provider`);
      }
    }
    throw new ServiceUnavailableException(
      `The assistant is temporarily unavailable. (${(lastErr as Error)?.message ?? 'all providers failed'})`,
    );
  }

  private roleSummary(user: AuthUser): string {
    if (user.isSuperAdmin) return 'a super administrator who can see the whole organisation';
    const roles = user.roles?.length ? user.roles.join(', ') : 'no role';
    return `role: ${roles}`;
  }
}
