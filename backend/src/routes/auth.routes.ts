import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

// Anon client for user-facing auth (signUp / signInWithPassword)
const anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const createStoreSchema = z.object({
  owner_name: z.string().min(1, 'Owner name is required'),
  store_name: z.string().min(1, 'Store name is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  upi_vpa: z.string().min(1, 'UPI VPA is required'),
  preferred_language: z.string().default('hi'),
});

// ─── Rate limiter (10 attempts / 15 min per IP) ───────────────────────────────

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (record && now < record.resetAt) {
    if (record.count >= RATE_LIMIT_MAX) return false;
    record.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  }
  return true;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new Supabase auth user with email + password.
 *
 * IMPORTANT: Disable email confirmation in Supabase Dashboard →
 *   Authentication → Providers → Email → "Confirm email" toggle OFF
 *
 * Body: { "email": "...", "password": "..." }
 */
router.post('/auth/register', async (req: Request, res: Response) => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'AUTH_BAD_REQUEST',
      details: result.error.flatten((i) => i.message),
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const { data, error } = await anonClient.auth.signUp({ email, password });

    if (error || !data.user) {
      logger.warn({ error: error?.message }, 'Registration failed');
      res.status(400).json({
        error: error?.message ?? 'Registration failed',
        code: 'AUTH_REGISTER_FAILED',
      });
      return;
    }

    res.status(201).json({
      access_token: data.session?.access_token ?? null,
      user: { id: data.user.id, email: data.user.email },
    });
  } catch (err) {
    logger.error({ err }, 'Register unexpected error');
    res.status(500).json({ error: 'Authentication service error', code: 'AUTH_ERROR' });
  }
});

/**
 * POST /api/auth/login
 * Signs in with email + password.
 * Also returns store_id if the user has already set up their store.
 *
 * Body: { "email": "...", "password": "..." }
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  const ip = req.ip ?? 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many login attempts, try again later', code: 'RATE_LIMIT_EXCEEDED' });
    return;
  }

  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'AUTH_BAD_REQUEST',
      details: result.error.flatten((i) => i.message),
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      logger.warn({ error: error?.message }, 'Login failed');
      res.status(401).json({
        error: error?.message ?? 'Login failed',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
      return;
    }

    // Resolve store_id for this user (null if onboarding not yet completed)
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', data.user.id)
      .single();

    res.json({
      access_token: data.session.access_token,
      expires_in: data.session.expires_in,
      user: { id: data.user.id, email: data.user.email },
      store_id: store?.id ?? null,
    });
  } catch (err) {
    logger.error({ err }, 'Login unexpected error');
    res.status(500).json({ error: 'Authentication service error', code: 'AUTH_ERROR' });
  }
});

/**
 * POST /api/auth/store
 * Creates the store record for an authenticated user.
 * Call once after registration to complete onboarding.
 * Idempotent — returns existing store_id if already created.
 *
 * Headers: Authorization: Bearer <access_token>
 * Body: { owner_name, store_name, phone, upi_vpa, preferred_language? }
 */
router.post('/auth/store', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token', code: 'AUTH_MISSING' });
    return;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    res.status(401).json({ error: 'Invalid or expired token', code: 'AUTH_INVALID' });
    return;
  }

  const result = createStoreSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'STORE_BAD_REQUEST',
      details: result.error.flatten((i) => i.message),
    });
    return;
  }

  try {
    // Idempotent: return existing store if already created
    const { data: existing } = await supabase
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      res.json({ store_id: existing.id });
      return;
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({ ...result.data, user_id: user.id })
      .select('id')
      .single();

    if (storeError || !store) {
      logger.error({ storeError }, 'Store creation failed');
      res.status(500).json({ error: 'Failed to create store', code: 'STORE_CREATE_FAILED' });
      return;
    }

    res.status(201).json({ store_id: store.id });
  } catch (err) {
    logger.error({ err }, 'Create store unexpected error');
    res.status(500).json({ error: 'Server error', code: 'SERVER_ERROR' });
  }
});

export default router;
