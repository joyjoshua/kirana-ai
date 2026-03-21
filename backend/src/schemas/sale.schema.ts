import { z } from 'zod';

/**
 * Schema for POST /api/parse-sale
 * Validates voice transcript input for LLM parsing.
 */
export const parseSaleSchema = z.object({
  body: z.object({
    transcript: z.string().min(1, 'Transcript cannot be empty').max(2000),
    store_id: z.string().uuid('Invalid store ID format'),
  }),
});

/**
 * Schema for POST /api/sales
 * Validates the confirmed sale commit payload.
 */
export const commitSaleSchema = z.object({
  body: z.object({
    store_id: z.string().uuid('Invalid store ID format'),
    items: z
      .array(
        z.object({
          sku_id: z.string().uuid('Invalid SKU ID format'),
          qty: z.number().positive('Quantity must be positive'),
          unit_price: z.number().nonnegative('Price cannot be negative'),
        })
      )
      .min(1, 'At least one item is required'),
  }),
});

/**
 * Schema for PATCH /api/sales/:saleId/confirm-payment
 */
export const confirmPaymentSchema = z.object({
  params: z.object({
    saleId: z.string().uuid('Invalid sale ID format'),
  }),
});

/**
 * Schema for GET /api/sales/:storeId
 */
export const salesHistorySchema = z.object({
  params: z.object({
    storeId: z.string().uuid('Invalid store ID format'),
  }),
});

export type ParseSaleInput = z.infer<typeof parseSaleSchema>;
export type CommitSaleInput = z.infer<typeof commitSaleSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type SalesHistoryInput = z.infer<typeof salesHistorySchema>;
