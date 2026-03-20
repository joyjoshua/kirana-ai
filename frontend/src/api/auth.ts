// Auth API — uses raw axios to avoid circular dependency with client.ts
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  user: { id: string; email: string | null };
  store_id: string | null;
}

export interface RegisterResponse {
  access_token: string | null;
  user: { id: string; email: string | null };
}

export interface CreateStoreInput {
  owner_name: string;
  store_name: string;
  phone: string;
  upi_vpa: string;
  preferred_language?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await axios.post<LoginResponse>(`${BASE}/api/auth/login`, { email, password });
  return data;
}

export async function register(email: string, password: string): Promise<RegisterResponse> {
  const { data } = await axios.post<RegisterResponse>(`${BASE}/api/auth/register`, { email, password });
  return data;
}

export async function createStore(input: CreateStoreInput, token: string): Promise<{ store_id: string }> {
  const { data } = await axios.post<{ store_id: string }>(`${BASE}/api/auth/store`, input, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}
