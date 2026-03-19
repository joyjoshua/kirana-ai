import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const router = Router();

// Use anon key for user-facing auth operations
const anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Zod schema for login body (H4)
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

// Simple in-memory rate limiter (M3): 10 attempts per IP per 15 minutes
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

/**
 * POST /api/auth/login
 *
 * Signs in with email + password.
 * Returns the JWT access_token to use as: Authorization: Bearer <token>
 *
 * Body: { "email": "...", "password": "..." }
 */
router.post('/auth/login', async (req: Request, res: Response) => {
  // Rate limiting (M3)
  const ip = req.ip ?? 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many login attempts, try again later', code: 'RATE_LIMIT_EXCEEDED' });
    return;
  }

  // Zod validation (H4)
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'AUTH_BAD_REQUEST',
      details: result.error.flatten((issue) => issue.message),
    });
    return;
  }

  const { email, password } = result.data;

  try {
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      logger.warn({ error: error?.message }, 'Login failed');
      res.status(401).json({
        error: error?.message ?? 'Login failed',
        code: 'AUTH_INVALID_CREDENTIALS',
      });
      return;
    }

    // H4: guard against null user on session (edge case)
    if (!data.user) {
      res.status(500).json({ error: 'Authentication service error', code: 'AUTH_ERROR' });
      return;
    }

    res.json({
      access_token: data.session.access_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        phone: data.user.phone,
        email: data.user.email,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Login unexpected error');
    res.status(500).json({ error: 'Authentication service error', code: 'AUTH_ERROR' });
  }
});

export default router;
