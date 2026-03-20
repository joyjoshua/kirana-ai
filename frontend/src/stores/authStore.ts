import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '@/api/auth';
import type { CreateStoreInput } from '@/api/auth';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  storeId: string | null;
  email: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<{ storeId: string | null }>;
  register: (email: string, password: string) => Promise<void>;
  createStore: (input: CreateStoreInput) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userId: null,
      storeId: null,
      email: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await authApi.login(email, password);
        set({
          accessToken: data.access_token,
          userId: data.user.id,
          storeId: data.store_id,
          email: data.user.email ?? email,
          isAuthenticated: true,
        });
        return { storeId: data.store_id };
      },

      register: async (email, password) => {
        const data = await authApi.register(email, password);
        set({
          accessToken: data.access_token,
          userId: data.user.id,
          storeId: null,
          email: data.user.email ?? email,
          isAuthenticated: true,
        });
      },

      createStore: async (input) => {
        const token = get().accessToken;
        if (!token) throw new Error('Not authenticated');
        const data = await authApi.createStore(input, token);
        set({ storeId: data.store_id });
      },

      logout: () => {
        set({ accessToken: null, userId: null, storeId: null, email: null, isAuthenticated: false });
      },
    }),
    {
      name: 'kirana-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        userId: state.userId,
        storeId: state.storeId,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
