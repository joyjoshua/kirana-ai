import api from './client';

interface StoreSetupPayload {
  owner_name: string;
  store_name: string;
  phone: string;
  upi_vpa: string;
  preferred_language: string;
}

interface StoreSetupResponse {
  store_id: string;
}

export async function setupStore(payload: StoreSetupPayload): Promise<StoreSetupResponse> {
  const { data } = await api.post<StoreSetupResponse>('/api/auth/store', payload);
  return data;
}

export async function fetchStoreId(): Promise<string | null> {
  const { data } = await api.get<{ store_id: string | null }>('/api/auth/store');
  return data.store_id;
}
