/**
 * Vendor record as stored in Supabase.
 */
export interface Vendor {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  language: string;
  created_at: string;
}

/**
 * Reorder draft result from the reorder service.
 */
export interface ReorderDraft {
  message: string;
  vendor_phone: string;
  vendor_name: string;
}
