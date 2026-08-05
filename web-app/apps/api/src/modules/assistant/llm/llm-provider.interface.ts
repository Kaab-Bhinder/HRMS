/**
 * A provider-neutral view of a tool-using chat model.
 *
 * The two vendors disagree on almost every detail of tool calling — OpenAI
 * uses `tool_calls` on the message plus `role: "tool"` replies, Anthropic uses
 * `tool_use` / `tool_result` content blocks. Normalising here is what makes a
 * fallback possible at all: the orchestrator runs one loop in these terms and
 * neither it nor the tool implementations know which vendor answered.
 */

/** A tool the model may call, described as JSON Schema (both vendors accept it). */
export interface ToolSpec {
  name: string;
  description: string;
  /** JSON Schema for the arguments object. */
  parameters: Record<string, unknown>;
}

/** A model's request to run one tool. */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/** One entry of conversation history, in neutral form. */
export type ChatTurn =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; toolCalls?: ToolCall[] }
  | { role: 'tool'; toolCallId: string; name: string; content: string };

/** What a provider returned for one turn. */
export interface LlmReply {
  text: string;
  toolCalls: ToolCall[];
  /** Which vendor actually produced this, for logging and the UI badge. */
  provider: string;
}

export const LLM_PROVIDERS = Symbol('LLM_PROVIDERS');

export interface LlmProvider {
  /** Stable id used in config, logs, and failover messages. */
  readonly name: string;
  /** False when the API key is missing — such a provider is skipped, not tried. */
  readonly ready: boolean;
  complete(system: string, turns: ChatTurn[], tools: ToolSpec[]): Promise<LlmReply>;
}

/**
 * Errors worth failing over on: the provider is down, overloaded, rate-limited,
 * or timed out. A 400 (our bad request) would fail identically on the other
 * vendor, so it propagates instead of burning the fallback.
 */
export function isRetryableLlmError(err: unknown): boolean {
  const status = (err as { status?: number; statusCode?: number })?.status ?? (err as { statusCode?: number })?.statusCode;
  if (typeof status === 'number') return status === 408 || status === 409 || status === 429 || status >= 500;
  const code = (err as { code?: string })?.code ?? '';
  return ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND'].includes(code);
}
