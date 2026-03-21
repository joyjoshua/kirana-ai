import api from './client';
import type { ReorderDraft } from '../types/vendor';

export async function createReorderDraft(skuId: string, storeId: string): Promise<ReorderDraft> {
  const { data } = await api.post<ReorderDraft>('/api/reorder/draft', {
    sku_id: skuId,
    store_id: storeId,
  });
  return data;
}
