import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { parseSaleSchema, commitSaleSchema, confirmPaymentSchema } from '../schemas/sale.schema';
import { parseSaleTranscript } from '../services/sale-parser.service';
import { commitSaleAndUpdateStock, confirmPayment } from '../services/inventory.service';

const router = Router();

/**
 * POST /api/parse-sale
 * Takes a voice transcript and returns structured sale items.
 * Uses LLM function calling for guaranteed JSON output.
 */
router.post(
  '/parse-sale',
  validate(parseSaleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transcript, store_id } = req.body;
      if (store_id !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }
      const result = await parseSaleTranscript(transcript, store_id);

      res.json({
        items: result.items,
        unmatched: result.unmatched,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/sales
 * Commits a confirmed sale — inserts sale + items, decrements stock,
 * checks thresholds. All-or-nothing transaction via Supabase RPC.
 */
router.post(
  '/sales',
  validate(commitSaleSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { store_id, items } = req.body;
      if (store_id !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }
      const result = await commitSaleAndUpdateStock(store_id, items);

      res.status(201).json({
        saleId: result.saleId,
        totalAmount: result.totalAmount,
        lowStockItems: result.lowStockItems,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/sales/:saleId/confirm-payment
 * Marks a sale as paid (mock payment confirmation for hackathon demo).
 */
router.patch(
  '/sales/:saleId/confirm-payment',
  validate(confirmPaymentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const saleId = req.params.saleId as string;
      const result = await confirmPayment(saleId, req.storeId!);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
