/**
 * Parsed sale item returned from the LLM parser.
 */
export interface ParsedItem {
  sku_id: string | null;
  name: string;
  qty: number;
  unit: string;
  price: number;
  confidence: 'high' | 'low';
}

/**
 * Result from the sale parsing service.
 */
export interface ParseSaleResult {
  items: ParsedItem[];
  unmatched: ParsedItem[];
}

/**
 * Item payload for committing a sale.
 */
export interface CommitSaleItem {
  sku_id: string;
  qty: number;
  unit_price: number;
}

/**
 * Low stock event — triggered when stock drops below reorder threshold.
 */
export interface LowStockEvent {
  sku_id: string;
  name: string;
  current_qty: number;
  threshold: number;
  reorder_qty: number;
  vendor_id: string | null;
}

/**
 * Result from the commit sale + stock update operation.
 */
export interface CommitSaleResult {
  saleId: string;
  totalAmount: number;
  lowStockItems: LowStockEvent[];
}
