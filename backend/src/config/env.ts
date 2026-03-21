import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),       // Publishable key (sb_publishable_... or legacy eyJ...)
  SUPABASE_SECRET_KEY: z.string().min(1),      // Secret key (sb_secret_... — replaces legacy service_role)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // LLM Provider Toggle
  // "lmstudio" = local Qwen3-8B via LM Studio (dev, free, no API key needed)
  // "paytm"    = Paytm Inference API (dev/staging, OpenAI-compatible)
  // "anthropic" = Claude via Anthropic API (production)
  LLM_PROVIDER: z.enum(['lmstudio', 'paytm', 'anthropic']).default('lmstudio'),

  // LM Studio (dev) — runs at localhost:1234 by default
  LM_STUDIO_BASE_URL: z.string().default('http://localhost:1234/v1'),
  LM_STUDIO_MODEL: z.string().default('qwen3-8b'),

  // Paytm Inference (dev/staging) — OpenAI-compatible API
  PAYTM_API_KEY: z.string().optional(),
  PAYTM_MODEL: z.string().default('qwen/qwen3-32b'),

  // Anthropic (production) — only required when LLM_PROVIDER=anthropic
  ANTHROPIC_API_KEY: z.string().optional(),

  // Sarvam AI — STT for Kannada/Hindi/Hinglish (fallback voice pipeline)
  SARVAM_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);

// Validate that Anthropic key exists when using Claude
if (env.LLM_PROVIDER === 'anthropic' && !env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic');
}
if (env.LLM_PROVIDER === 'paytm' && !env.PAYTM_API_KEY) {
  throw new Error('PAYTM_API_KEY is required when LLM_PROVIDER=paytm');
}

export type Env = z.infer<typeof envSchema>;
