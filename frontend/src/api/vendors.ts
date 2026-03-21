import api from './client';
import type { Vendor } from '../types/vendor';

export async function getVendors(storeId: string): Promise<Vendor[]> {
  const { data } = await api.get<Vendor[]>(`/api/vendors/${storeId}`);
  return data;
}
