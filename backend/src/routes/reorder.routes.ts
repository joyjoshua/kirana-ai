import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { reorderDraftSchema } from '../schemas/reorder.schema';
import { generateReorderDraft } from '../services/reorder.service';

const router = Router();

/**
 * POST /api/reorder/draft
 * Generates an AI-drafted WhatsApp reorder message for a vendor.
 * The message is in the vendor's preferred language and ready to send via wa.me deep-link.
 */
router.post(
  '/reorder/draft',
  validate(reorderDraftSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sku_id, store_id } = req.body;
      if (store_id !== req.storeId) {
        res.status(403).json({ error: 'Access denied', code: 'AUTH_FORBIDDEN' });
        return;
      }
      const draft = await generateReorderDraft(sku_id, store_id);

      // Include wa.me deep-link for one-tap WhatsApp integration (L1: replace all + chars)
      const waLink = `https://wa.me/${draft.vendor_phone.replace(/\+/g, '')}?text=${encodeURIComponent(draft.message)}`;

      res.json({
        message: draft.message,
        vendor_name: draft.vendor_name,
        vendor_phone: draft.vendor_phone,
        whatsapp_link: waLink,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
