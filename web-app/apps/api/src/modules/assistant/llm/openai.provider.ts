import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { ChatTurn, LlmProvider, LlmReply, ToolSpec } from './llm-provider.interface';

/** Primary provider. Maps the neutral shapes onto OpenAI's chat-completions API. */
@Injectable()
export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai';
  private readonly log = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o';
    this.client = apiKey ? new OpenAI({ apiKey, timeout: 60_000, maxRetries: 1 }) : null;
    if (!this.client) this.log.warn('OPENAI_API_KEY not set — OpenAI provider disabled');
  }

  get ready(): boolean {
    return this.client !== null;
  }

  async complete(system: string, turns: ChatTurn[], tools: ToolSpec[]): Promise<LlmReply> {
    const messages: ChatCompletionMessageParam[] = [{ role: 'system', content: system }];
    for (const t of turns) {
      if (t.role === 'user') {
        messages.push({ role: 'user', content: t.content });
      } else if (t.role === 'assistant') {
        messages.push({
          role: 'assistant',
          content: t.content || null,
          ...(t.toolCalls?.length
            ? {
                tool_calls: t.toolCalls.map((c) => ({
                  id: c.id,
                  type: 'function' as const,
                  function: { name: c.name, arguments: JSON.stringify(c.arguments) },
                })),
              }
            : {}),
        });
      } else {
        // OpenAI carries results as their own role, keyed by the call id.
        messages.push({ role: 'tool', tool_call_id: t.toolCallId, content: t.content });
      }
    }

    const res = await this.client!.chat.completions.create({
      model: this.model,
      messages,
      ...(tools.length
        ? {
            tools: tools.map<ChatCompletionTool>((t) => ({
              type: 'function',
              function: { name: t.name, description: t.description, parameters: t.parameters },
            })),
          }
        : {}),
    });

    const choice = res.choices[0]?.message;
    const toolCalls = (choice?.tool_calls ?? []).flatMap((c) => {
      if (c.type !== 'function') return [];
      return [{ id: c.id, name: c.function.name, arguments: safeParse(c.function.arguments) }];
    });
    return { text: choice?.content ?? '', toolCalls, provider: this.name };
  }
}

/** A model can emit malformed JSON arguments; an empty object beats a crash. */
function safeParse(raw: string): Record<string, unknown> {
  try {
    const v = JSON.parse(raw || '{}');
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
