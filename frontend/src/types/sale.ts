export interface ParsedItem {
  sku_id: string | null;
  name: string;
  qty: number;
  unit: string;
  price: number;
  confidence: 'high' | 'low';
}

export interface ParseSaleResponse {
  items: ParsedItem[];
  unmatched: ParsedItem[];
}

export interface CommitSaleItem {
  sku_id: string;
  qty: number;
  unit_price: number;
}

export interface LowStockEvent {
  sku_id: string;
  name: string;
  current_qty: number;
  threshold: number;
  reorder_qty: number;
  vendor_id: string | null;
}

export interface CommitSaleResponse {
  sale_id: string;
  total_amount: number;
  low_stock_items: LowStockEvent[];
}

export interface ConfirmPaymentResponse {
  sale_id: string;
  payment_status: 'paid';
  confirmed_at: string;
}
