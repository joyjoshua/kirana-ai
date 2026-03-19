import { z } from 'zod';

/**
 * Schema for POST /api/reorder/draft
 */
export const reorderDraftSchema = z.object({
  body: z.object({
    sku_id: z.string().uuid('Invalid SKU ID format'),
    store_id: z.string().uuid('Invalid store ID format'),
  }),
});

export type ReorderDraftInput = z.infer<typeof reorderDraftSchema>;
