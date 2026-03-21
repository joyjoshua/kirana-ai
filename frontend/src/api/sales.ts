import api from './client';
import type { ParseSaleResponse, CommitSaleResponse, CommittedSaleItem } from '../types/sale';

export async function parseSale(transcript: string, storeId: string): Promise<ParseSaleResponse> {
  const { data } = await api.post<ParseSaleResponse>('/api/parse-sale', {
    transcript,
    store_id: storeId,
  });
  return data;
}

export async function commitSale(
  storeId: string,
  items: CommittedSaleItem[]
): Promise<CommitSaleResponse> {
  const { data } = await api.post<CommitSaleResponse>('/api/sales', {
    store_id: storeId,
    items,
  });
  return data;
}

export async function confirmPayment(saleId: string): Promise<{ id: string; payment_status: string }> {
  const { data } = await api.patch<{ id: string; payment_status: string }>(
    `/api/sales/${saleId}/confirm-payment`
  );
  return data;
}
