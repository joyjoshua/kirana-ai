import { z } from 'zod';

/**
 * Schema for POST /api/qr/generate
 */
export const generateQrSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    store_id: z.string().uuid('Invalid store ID format'),
    sale_id: z.string().uuid('Invalid sale ID format'),
  }),
});

export type GenerateQrInput = z.infer<typeof generateQrSchema>;
