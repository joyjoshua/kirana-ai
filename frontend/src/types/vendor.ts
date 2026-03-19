export interface Vendor {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  language: string;
  created_at: string;
}

export interface ReorderDraft {
  id: string;
  store_id: string;
  sku_id: string;
  vendor_id: string;
  message: string;
  status: 'draft' | 'sent';
  vendor_phone: string;
  created_at: string;
}
