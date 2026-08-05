import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleProvider } from './openai-compatible.provider';

/**
 * Third-line fallback: OpenRouter, which fronts many vendors behind the
 * OpenAI dialect. Useful as a last resort because it is cheap and rarely down
 * at the same time as both first-party APIs.
 *
 * IMPORTANT: pick a model that supports TOOL CALLING. This assistant answers
 * by calling scoped tools; a model without tool support will happily reply in
 * prose and invent numbers instead of looking them up. Verified-good choices
 * are noted in .env.example.
 */
@Injectable()
export class OpenRouterProvider extends OpenAiCompatibleProvider {
  readonly name = 'openrouter';

  constructor() {
    super({
      name: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash',
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'https://hr-client.local',
        'X-Title': 'HR Assistant',
      },
    });
    if (!this.ready) this.log.warn('OPENROUTER_API_KEY not set — OpenRouter fallback disabled');
  }
}
