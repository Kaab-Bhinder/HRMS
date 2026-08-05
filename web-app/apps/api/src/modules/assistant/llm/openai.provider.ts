import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleProvider } from './openai-compatible.provider';

/** Primary provider: OpenAI proper. */
@Injectable()
export class OpenAiProvider extends OpenAiCompatibleProvider {
  readonly name = 'openai';

  constructor() {
    super({
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    });
    if (!this.ready) this.log.warn('OPENAI_API_KEY not set — OpenAI provider disabled');
  }
}
