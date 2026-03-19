import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import {
  getInventorySchema,
  createInventorySchema,
  updateInventorySchema,
} from '../schemas/inventory.schema';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
} from '../services/inventory.service';

const router = Router();

/**
 * GET /api/inventory/:storeId
 * Returns all inventory items for a given store, sorted by name.
 */
router.get(
  '/inventory/:storeId',
  validate(getInventorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.params.storeId !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }
      const items = await getInventory(req.params.storeId);
      res.json({ items, count: items.length });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/inventory
 * Creates a new inventory item for a store.
 */
router.post(
  '/inventory',
  validate(createInventorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.store_id !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }
      const item = await createInventoryItem(req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/inventory/:skuId
 * Partially updates an existing inventory item.
 */
router.patch(
  '/inventory/:skuId',
  validate(updateInventorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await updateInventoryItem(req.params.skuId as string, req.storeId!, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
