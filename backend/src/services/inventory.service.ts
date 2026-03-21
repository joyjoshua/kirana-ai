import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { InsufficientStockError, NotFoundError } from '../middleware/error-handler';
import type {
  CommitSaleItem,
  CommitSaleResult,
  LowStockEvent,
} from '../types/sale.types';
import type {
  CreateInventoryPayload,
  UpdateInventoryPayload,
  InventoryItem,
} from '../types/inventory.types';

// ─── Sale Commit (Transactional) ────────────────────────────────────

/**
 * Commits a sale and updates stock in a single Postgres transaction via RPC.
 *
 * The `commit_sale` RPC function:
 * - Inserts the sale record
 * - Inserts all sale_items
 * - Decrements stock for each item (with negative-stock guard)
 * - Logs stock changes
 * - Returns low-stock warnings for items below threshold
 *
 * If any item has insufficient stock, the entire transaction rolls back.
 */
export async function commitSaleAndUpdateStock(
  storeId: string,
  items: CommitSaleItem[]
): Promise<CommitSaleResult> {
  logger.info({ storeId, itemCount: items.length }, 'Committing sale');

  const { data, error } = await supabase.rpc('commit_sale', {
    p_store_id: storeId,
    p_items: items,
  });

  if (error) {
    // The RPC raises 'Insufficient stock for SKU <uuid>' on stock guard failure
    if (error.message.includes('Insufficient stock')) {
      const skuId = error.message.match(/SKU (.+)/)?.[1] || 'unknown';
      throw new InsufficientStockError(skuId);
    }
    logger.error({ error }, 'Failed to commit sale via RPC');
    throw error;
  }

  logger.info(
    { saleId: data.sale_id, total: data.total_amount, lowStockCount: data.low_stock_items?.length },
    'Sale committed successfully'
  );

  return {
    saleId: data.sale_id,
    totalAmount: data.total_amount,
    lowStockItems: data.low_stock_items || [],
  };
}

// ─── Payment Confirmation ───────────────────────────────────────────

/**
 * Marks a sale as paid (mock payment confirmation for hackathon demo).
 */
export async function confirmPayment(saleId: string, storeId: string) {
  const { data, error } = await supabase
    .from('sales')
    .update({ payment_status: 'paid' })
    .eq('id', saleId)
    .eq('store_id', storeId)
    .select('id, payment_status, total_amount')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Sale', saleId);
    }
    logger.error({ error, saleId }, 'Failed to confirm payment');
    throw error;
  }

  if (!data) {
    throw new NotFoundError('Sale', saleId);
  }

  return data;
}

// ─── Inventory CRUD ─────────────────────────────────────────────────

/**
 * Fetches all inventory items for a given store.
 */
export async function getInventory(storeId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('store_id', storeId)
    .order('name', { ascending: true });

  if (error) {
    logger.error({ error, storeId }, 'Failed to fetch inventory');
    throw error;
  }

  return data || [];
}

/**
 * Creates a new inventory item for a store.
 */
export async function createInventoryItem(
  payload: CreateInventoryPayload
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .insert({
      store_id: payload.store_id,
      name: payload.name,
      aliases: payload.aliases || [],
      stock_qty: payload.stock_qty,
      unit: payload.unit,
      sale_price: payload.sale_price,
      cost_price: payload.cost_price,
      reorder_threshold: payload.reorder_threshold ?? 5,
      reorder_qty: payload.reorder_qty ?? 10,
      vendor_id: payload.vendor_id || null,
    })
    .select('*')
    .single();

  if (error) {
    logger.error({ error, payload }, 'Failed to create inventory item');
    throw error;
  }

  logger.info({ skuId: data.id, name: data.name }, 'Inventory item created');
  return data;
}

/**
 * Updates an existing inventory item (partial update).
 */
export async function updateInventoryItem(
  skuId: string,
  storeId: string,
  payload: UpdateInventoryPayload
): Promise<InventoryItem> {
  // Filter out undefined fields — only update provided ones
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No fields provided for update');
  }

  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', skuId)
    .eq('store_id', storeId)
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Inventory item', skuId);
    }
    logger.error({ error, skuId, updates }, 'Failed to update inventory item');
    throw error;
  }

  if (!data) {
    throw new NotFoundError('Inventory item', skuId);
  }

  logger.info({ skuId: data.id, name: data.name }, 'Inventory item updated');
  return data;
}
