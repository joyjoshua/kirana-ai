import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// --- Provider configs ---

const LM_STUDIO_CONFIG = {
  baseURL: env.LM_STUDIO_BASE_URL,        // http://localhost:1234/v1
  apiKey: 'lm-studio',                     // LM Studio doesn't need a real key
  defaultModel: env.LM_STUDIO_MODEL,       // qwen3-8b
  parseModel: env.LM_STUDIO_MODEL,         // Same model for all tasks in dev
  draftModel: env.LM_STUDIO_MODEL,
};

const ANTHROPIC_CONFIG = {
  baseURL: 'https://api.anthropic.com/v1',
  apiKey: env.ANTHROPIC_API_KEY || '',
  defaultModel: 'claude-haiku-4-5-20251001',
  parseModel: 'claude-haiku-4-5-20251001',     // Haiku for structured extraction (fast + cheap)
  draftModel: 'claude-sonnet-4-6',              // Sonnet for creative drafting (M4: updated model ID)
};

const config = env.LLM_PROVIDER === 'lmstudio' ? LM_STUDIO_CONFIG : ANTHROPIC_CONFIG;

/**
 * Single OpenAI-compatible client — works with both LM Studio and Anthropic Claude.
 *
 * LM Studio exposes an OpenAI-compatible API at localhost:1234/v1.
 * Anthropic supports the OpenAI SDK format via their messages endpoint.
 */
export const llm = new OpenAI({
  baseURL: config.baseURL,
  apiKey: config.apiKey,
  timeout: 30_000, // L4: 30s timeout — prevents hanging requests if LLM is unresponsive
});

/** Model for structured parsing tasks (sale transcript extraction). */
export const PARSE_MODEL = config.parseModel;

/** Model for creative generation tasks (reorder message drafting). */
export const DRAFT_MODEL = config.draftModel;

// L6: exported so index.ts can log after the app is fully initialised
export function logLlmProvider(): void {
  logger.info(
    {
      provider: env.LLM_PROVIDER,
      baseURL: config.baseURL,
      parseModel: PARSE_MODEL,
      draftModel: DRAFT_MODEL,
    },
    'LLM provider initialized'
  );
}
