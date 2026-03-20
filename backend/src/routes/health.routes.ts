import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * GET /api/health
 * Public health check endpoint — no auth required.
 * Checks DB connectivity and returns server status.
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('stores').select('id').limit(1);

    res.json({
      status: error ? 'degraded' : 'ok',
      timestamp: new Date().toISOString(),
      db: error ? 'down' : 'up',
      version: '1.0.0',
      _debug: error ? { message: error.message, code: error.code, details: error.details } : undefined,
    });
  } catch (err) {
    res.json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      db: 'down',
      version: '1.0.0',
      _debug: { message: String(err) },
    });
  }
});

export default router;
