import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// Extend Express Request to include authenticated user context
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      storeId?: string;
    }
  }
}

// Dedicated auth client using service-role key for JWT verification
const authClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Supabase JWT auth middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it with Supabase Auth, and attaches userId + storeId
 * to the request object for downstream use.
 *
 * To get a JWT token for testing:
 * 1. Sign up / sign in via the Supabase Auth UI or client SDK
 * 2. The session object returned contains `access_token`
 * 3. Send it as: Authorization: Bearer <access_token>
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Missing or malformed authorization token',
      code: 'AUTH_MISSING',
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify JWT with Supabase
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(token);

    if (error || !user) {
      logger.warn({ error: error?.message }, 'Auth token verification failed');
      res.status(401).json({
        error: 'Invalid or expired token',
        code: 'AUTH_INVALID',
      });
      return;
    }

    // Look up the store associated with this auth user
    const { data: store, error: storeError } = await authClient
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (storeError && storeError.code !== 'PGRST116') {
      logger.error({ storeError }, 'Store lookup failed');
      res.status(500).json({ error: 'Authentication service error', code: 'AUTH_ERROR' });
      return;
    }

    if (!store) {
      res.status(403).json({ error: 'No store associated with this account', code: 'AUTH_NO_STORE' });
      return;
    }

    req.userId = user.id;
    req.storeId = store.id;

    next();
  } catch (err) {
    logger.error({ err }, 'Auth middleware unexpected error');
    res.status(500).json({
      error: 'Authentication service error',
      code: 'AUTH_ERROR',
    });
  }
}
