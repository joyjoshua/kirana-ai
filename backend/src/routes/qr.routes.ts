import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { generateQrSchema } from '../schemas/qr.schema';
import { generateUpiQr } from '../services/qr.service';

const router = Router();

/**
 * POST /api/qr/generate
 * Generates a UPI QR code for a given sale amount.
 * Returns a base64 PNG data URL and the raw UPI deep-link.
 */
router.post(
  '/qr/generate',
  validate(generateQrSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, store_id, sale_id } = req.body;
      if (store_id !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }
      const result = await generateUpiQr(amount, store_id, sale_id);

      res.json({
        qr_data_url: result.qr_data_url,
        upi_link: result.upi_link,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
