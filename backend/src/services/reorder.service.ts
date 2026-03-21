import { chatComplete, DRAFT_MODEL } from './llm.service';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { NotFoundError } from '../middleware/error-handler';
import type { ReorderDraft } from '../types/vendor.types';

/**
 * Generates an AI-drafted WhatsApp reorder message for a vendor.
 *
 * Flow:
 * 1. Fetches inventory item, store, and vendor details from Supabase
 * 2. Sends context to LLM to draft a natural, localized WhatsApp message
 * 3. Logs the draft in reorder_drafts table for audit trail
 *
 * The message is generated in the vendor's preferred language
 * (Hindi, Kannada, English) and kept brief for WhatsApp.
 *
 * @param skuId   - UUID of the inventory item that needs reordering
 * @param storeId - UUID of the store
 */
export async function generateReorderDraft(
  skuId: string,
  storeId: string
): Promise<ReorderDraft> {
  // 1. Fetch item details
  const { data: item, error: itemErr } = await supabase
    .from('inventory')
    .select('name, reorder_qty, unit, vendor_id, stock_qty')
    .eq('id', skuId)
    .single();

  if (itemErr || !item) {
    throw new NotFoundError('Inventory item', skuId);
  }

  if (!item.vendor_id) {
    throw new Error(`No vendor assigned to item ${skuId} (${item.name})`);
  }

  // 2. Fetch store details
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('store_name, owner_name')
    .eq('id', storeId)
    .single();

  if (storeErr || !store) {
    throw new NotFoundError('Store', storeId);
  }

  // 3. Fetch vendor details
  const { data: vendor, error: vendorErr } = await supabase
    .from('vendors')
    .select('name, phone, language')
    .eq('id', item.vendor_id)
    .single();

  if (vendorErr || !vendor) {
    throw new NotFoundError('Vendor', item.vendor_id);
  }

  logger.info(
    { skuId, storeName: store.store_name, vendorName: vendor.name },
    'Generating reorder draft'
  );

  // 4. Generate WhatsApp message via LLM
  const message = (await chatComplete({
    model: DRAFT_MODEL,
    max_tokens: 256,
    temperature: 0.7, // Higher for natural, human-sounding language
    messages: [
      {
        role: 'system',
        content: `You write WhatsApp messages for a kirana store owner to send to their supplier/vendor.
Write in ${vendor.language || 'hi'} (hi=Hindi, kn=Kannada, en=English).
Be friendly, brief (max 3 sentences). Include a greeting with the vendor's name.
Mention the item name, quantity needed, and unit.
Do not use emojis for formal vendors. Keep it professional but warm.
Return ONLY the message text — no quotes, no prefixes, no explanations.`,
      },
      {
        role: 'user',
        content: `Store: ${store.store_name} (owner: ${store.owner_name})
Item: ${item.name}
Current stock: ${item.stock_qty} ${item.unit}
Qty needed: ${item.reorder_qty} ${item.unit}
Vendor: ${vendor.name}`,
      },
    ],
  })).trim();

  if (!message) {
    logger.warn({ skuId }, 'LLM returned empty reorder draft');
    throw new Error('Failed to generate reorder message');
  }

  // 5. Log the draft for audit trail (M2: surface insert errors instead of silently dropping)
  const { error: draftError } = await supabase.from('reorder_drafts').insert({
    store_id: storeId,
    sku_id: skuId,
    vendor_id: item.vendor_id,
    message,
    status: 'draft',
  });
  if (draftError) {
    logger.warn({ draftError, skuId }, 'Failed to log reorder draft to audit table');
  }

  logger.info(
    { skuId, vendorName: vendor.name, messageLength: message.length },
    'Reorder draft generated'
  );

  return {
    message,
    vendor_phone: vendor.phone,
    vendor_name: vendor.name,
  };
}
