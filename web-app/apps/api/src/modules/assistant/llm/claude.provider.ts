import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ChatTurn, LlmProvider, LlmReply, ToolCall, ToolSpec } from './llm-provider.interface';

/**
 * Fallback provider. Anthropic models tool calling as content BLOCKS rather
 * than a separate message role: a `tool_use` block on the assistant turn, and a
 * matching `tool_result` block inside the following user turn. Consecutive
 * results must be merged into one user message, which is the main shape
 * difference from OpenAI.
 */
@Injectable()
export class ClaudeProvider implements LlmProvider {
  readonly name = 'claude';
  private readonly log = new Logger(ClaudeProvider.name);
  private readonly client: Anthropic | null;
  private readonly model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = process.env.ANTHROPIC_MODEL || 'claude-opus-5';
    this.client = apiKey ? new Anthropic({ apiKey, timeout: 60_000, maxRetries: 1 }) : null;
    if (!this.client) this.log.warn('ANTHROPIC_API_KEY not set — Claude provider disabled');
  }

  get ready(): boolean {
    return this.client !== null;
  }

  async complete(system: string, turns: ChatTurn[], tools: ToolSpec[]): Promise<LlmReply> {
    const messages: Anthropic.MessageParam[] = [];
    for (const t of turns) {
      if (t.role === 'user') {
        messages.push({ role: 'user', content: t.content });
      } else if (t.role === 'assistant') {
        const blocks: Anthropic.ContentBlockParam[] = [];
        if (t.content) blocks.push({ type: 'text', text: t.content });
        for (const c of t.toolCalls ?? []) {
          blocks.push({ type: 'tool_use', id: c.id, name: c.name, input: c.arguments });
        }
        if (blocks.length) messages.push({ role: 'assistant', content: blocks });
      } else {
        // Results ride in a user turn. Merge into the previous one when the
        // model called several tools at once — separate messages would break
        // the tool_use/tool_result pairing the API validates.
        const block: Anthropic.ContentBlockParam = {
          type: 'tool_result',
          tool_use_id: t.toolCallId,
          content: t.content,
        };
        const prev = messages[messages.length - 1];
        if (prev?.role === 'user' && Array.isArray(prev.content)) {
          (prev.content as Anthropic.ContentBlockParam[]).push(block);
        } else {
          messages.push({ role: 'user', content: [block] });
        }
      }
    }

    const res = await this.client!.messages.create({
      model: this.model,
      max_tokens: 4096,
      // Adaptive thinking: the assistant chains several scoped lookups to answer
      // one question, which is exactly the multi-step case it helps with.
      thinking: { type: 'adaptive' },
      system,
      messages,
      ...(tools.length
        ? {
            tools: tools.map((t) => ({
              name: t.name,
              description: t.description,
              input_schema: t.parameters as Anthropic.Tool.InputSchema,
            })),
          }
        : {}),
    });

    // Safety classifiers can decline; content is empty or partial, so check
    // before reading it rather than indexing blindly.
    if (res.stop_reason === 'refusal') {
      return { text: 'I can’t help with that request.', toolCalls: [], provider: this.name };
    }

    let text = '';
    const toolCalls: ToolCall[] = [];
    for (const block of res.content) {
      if (block.type === 'text') text += block.text;
      else if (block.type === 'tool_use') {
        toolCalls.push({ id: block.id, name: block.name, arguments: (block.input ?? {}) as Record<string, unknown> });
      }
    }
    return { text, toolCalls, provider: this.name };
  }
}
