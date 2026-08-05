import { Logger } from '@nestjs/common';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { ChatTurn, LlmProvider, LlmReply, ToolSpec } from './llm-provider.interface';

/**
 * Shared implementation for every vendor that speaks the OpenAI
 * chat-completions dialect — OpenAI itself, OpenRouter, and most self-hosted
 * gateways. Only the base URL, key, and model differ, so the message mapping
 * lives here once rather than being copied per vendor.
 */
export abstract class OpenAiCompatibleProvider implements LlmProvider {
  abstract readonly name: string;
  protected readonly log: Logger;
  protected readonly client: OpenAI | null;
  protected readonly model: string;

  protected constructor(opts: {
    name: string;
    apiKey?: string;
    model: string;
    baseURL?: string;
    /** OpenRouter attributes traffic with these; harmless elsewhere. */
    defaultHeaders?: Record<string, string>;
  }) {
    this.log = new Logger(opts.name);
    this.model = opts.model;
    this.client = opts.apiKey
      ? new OpenAI({
          apiKey: opts.apiKey,
          ...(opts.baseURL ? { baseURL: opts.baseURL } : {}),
          ...(opts.defaultHeaders ? { defaultHeaders: opts.defaultHeaders } : {}),
          timeout: 60_000,
          maxRetries: 1,
        })
      : null;
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
