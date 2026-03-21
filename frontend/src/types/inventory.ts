export interface InventoryItem {
  id: string;
  store_id: string;
  name: string;
  aliases: string[];
  stock_qty: number;
  unit: string;
  sale_price: number;
  cost_price: number;
  reorder_threshold: number;
  reorder_qty: number;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
}
