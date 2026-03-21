import api from './client';
import type { InventoryItem } from '../types/inventory';

interface InventoryResponse {
  items: InventoryItem[];
  count: number;
}

export async function getInventory(storeId: string): Promise<InventoryItem[]> {
  const { data } = await api.get<InventoryResponse | InventoryItem[]>(`/api/inventory/${storeId}`);
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as InventoryResponse).items)) return (data as InventoryResponse).items;
  return [];
}

export interface CreateItemPayload {
  store_id: string;
  name: string;
  stock_qty: number;
  unit: string;
  sale_price: number;
  cost_price: number;
  reorder_threshold: number;
  reorder_qty: number;
  aliases: string[];
}

export async function createInventoryItem(payload: CreateItemPayload): Promise<InventoryItem> {
  const { data } = await api.post<InventoryItem>('/api/inventory', payload);
  return data;
}
