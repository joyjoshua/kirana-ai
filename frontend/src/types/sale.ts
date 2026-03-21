export interface SaleItem {
  sku_id: string | null;
  name: string;
  qty: number;
  unit: string;
  price: number;
  confidence: 'high' | 'low';
}

export interface CommittedSaleItem {
  sku_id: string;
  qty: number;
  unit_price: number;
}

export interface LowStockItem {
  sku_id: string;
  name: string;
  current_qty: number;
  threshold: number;
  reorder_qty: number;
  vendor_id: string | null;
}

export interface Sale {
  id: string;
  store_id: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface SaleHistoryItem {
  sku_id: string;
  qty: number;
  unit_price: number;
  subtotal: number;
  name: string;
  unit: string;
}

export interface SaleHistory {
  id: string;
  store_id: string;
  total_amount: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  items: SaleHistoryItem[];
}

export interface ParseSaleResponse {
  items: SaleItem[];
  unmatched: SaleItem[];
}

export interface CommitSaleResponse {
  saleId: string;
  totalAmount: number;
  lowStockItems: LowStockItem[];
}
