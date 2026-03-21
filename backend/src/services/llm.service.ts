import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// --- Provider configs ---

const LM_STUDIO_CONFIG = {
  baseURL: env.LM_STUDIO_BASE_URL,        // http://localhost:1234/v1
  apiKey: 'lm-studio',                     // LM Studio doesn't need a real key
  defaultModel: env.LM_STUDIO_MODEL,       // qwen3-8b
  parseModel: env.LM_STUDIO_MODEL,
  draftModel: env.LM_STUDIO_MODEL,
};

const PAYTM_CONFIG = {
  baseURL: 'https://api.inference.paytm.com/v1',
  apiKey: env.PAYTM_API_KEY || '',
  defaultModel: env.PAYTM_MODEL,           // qwen/qwen3-32b
  parseModel: env.PAYTM_MODEL,
  draftModel: env.PAYTM_MODEL,
};

const ANTHROPIC_CONFIG = {
  baseURL: 'https://api.anthropic.com/v1', // unused by SDK but kept for reference
  apiKey: env.ANTHROPIC_API_KEY || '',
  defaultModel: 'claude-haiku-4-5-20251001',
  parseModel: 'claude-haiku-4-5-20251001',     // Haiku for structured extraction (fast + cheap)
  draftModel: 'claude-sonnet-4-6',              // Sonnet for creative drafting
};

const config =
  env.LLM_PROVIDER === 'lmstudio' ? LM_STUDIO_CONFIG :
  env.LLM_PROVIDER === 'paytm'    ? PAYTM_CONFIG :
  ANTHROPIC_CONFIG;

/**
 * OpenAI-compatible client for LM Studio and Paytm providers.
 * NOT used for Anthropic (which has its own SDK and API format).
 */
export const llm = new OpenAI({
  baseURL: config.baseURL,
  apiKey: config.apiKey,
  timeout: env.LLM_PROVIDER === 'lmstudio' ? 120_000 : 30_000,
});

/**
 * Anthropic SDK client — used only when LLM_PROVIDER=anthropic.
 * Anthropic uses POST /v1/messages (not /v1/chat/completions).
 */
const anthropicClient = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY || '',
  timeout: 30_000,
});

/** Model for structured parsing tasks (sale transcript extraction). */
export const PARSE_MODEL = config.parseModel;

/** Model for creative generation tasks (reorder message drafting). */
export const DRAFT_MODEL = config.draftModel;

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

/**
 * Unified chat completion — routes to the correct SDK based on LLM_PROVIDER.
 *
 * - lmstudio / paytm: OpenAI-compatible /chat/completions endpoint
 * - anthropic: Anthropic SDK /messages endpoint (different request/response shape)
 *
 * Returns the assistant message text directly.
 */
export async function chatComplete(params: {
  model: string;
  max_tokens: number;
  temperature: number;
  messages: ChatMessage[];
}): Promise<string> {
  if (env.LLM_PROVIDER === 'anthropic') {
    const systemMsg = params.messages.find((m) => m.role === 'system')?.content ?? '';
    const userMsgs = params.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await anthropicClient.messages.create({
      model: params.model,
      max_tokens: params.max_tokens,
      temperature: params.temperature,
      ...(systemMsg && { system: systemMsg }),
      messages: userMsgs,
    });

    const block = response.content[0];
    return block?.type === 'text' ? block.text : '';
  }

  // LM Studio or Paytm — both expose OpenAI-compatible /chat/completions
  const response = await llm.chat.completions.create({
    model: params.model,
    max_tokens: params.max_tokens,
    temperature: params.temperature,
    messages: params.messages,
  });

  return response.choices[0]?.message?.content ?? '';
}

// L6: exported so index.ts can log after the app is fully initialised
export function logLlmProvider(): void {
  logger.info(
    {
      provider: env.LLM_PROVIDER,
      parseModel: PARSE_MODEL,
      draftModel: DRAFT_MODEL,
    },
    'LLM provider initialized'
  );
}
