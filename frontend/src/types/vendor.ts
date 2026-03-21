export interface Vendor {
  id: string;
  store_id: string;
  name: string;
  phone: string;
  language: string;
  created_at: string;
}

export interface ReorderDraft {
  message: string;
  vendor_phone: string;
  vendor_name: string;
}
