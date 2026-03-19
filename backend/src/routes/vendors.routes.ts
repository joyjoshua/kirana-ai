import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Schema for GET /api/vendors/:storeId
 */
const getVendorsSchema = z.object({
  params: z.object({
    storeId: z.string().uuid('Invalid store ID format'),
  }),
});

/**
 * GET /api/vendors/:storeId
 * Lists all vendors associated with a store.
 */
router.get(
  '/vendors/:storeId',
  validate(getVendorsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { storeId } = req.params;
      if (storeId !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('store_id', storeId)
        .order('name', { ascending: true });

      if (error) {
        logger.error({ error, storeId }, 'Failed to fetch vendors');
        throw error;
      }

      res.json({ vendors: data || [], count: data?.length || 0 });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
