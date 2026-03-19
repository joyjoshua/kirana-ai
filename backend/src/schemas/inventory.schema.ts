import { z } from 'zod';

/**
 * Schema for GET /api/inventory/:storeId
 */
export const getInventorySchema = z.object({
  params: z.object({
    storeId: z.string().uuid('Invalid store ID format'),
  }),
});

/**
 * Schema for POST /api/inventory — create new inventory item
 */
export const createInventorySchema = z.object({
  body: z.object({
    store_id: z.string().uuid('Invalid store ID format'),
    name: z.string().min(1, 'Name is required').max(200),
    aliases: z.array(z.string()).default([]),
    stock_qty: z.number().nonnegative('Stock quantity cannot be negative'),
    unit: z.string().min(1).max(20).default('pcs'),
    sale_price: z.number().nonnegative('Sale price cannot be negative'),
    cost_price: z.number().nonnegative('Cost price cannot be negative'),
    reorder_threshold: z.number().nonnegative().default(5),
    reorder_qty: z.number().nonnegative().default(10),
    vendor_id: z.string().uuid().optional(),
  }),
});

/**
 * Schema for PATCH /api/inventory/:skuId — update existing inventory item
 */
export const updateInventorySchema = z.object({
  params: z.object({
    skuId: z.string().uuid('Invalid SKU ID format'),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    aliases: z.array(z.string()).optional(),
    stock_qty: z.number().nonnegative('Stock quantity cannot be negative').optional(),
    unit: z.string().min(1).max(20).optional(),
    sale_price: z.number().nonnegative('Sale price cannot be negative').optional(),
    cost_price: z.number().nonnegative('Cost price cannot be negative').optional(),
    reorder_threshold: z.number().nonnegative().optional(),
    reorder_qty: z.number().nonnegative().optional(),
    vendor_id: z.string().uuid().nullable().optional(),
  }),
});

export type GetInventoryInput = z.infer<typeof getInventorySchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
