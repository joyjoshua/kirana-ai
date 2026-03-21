import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient, type Session } from '@supabase/supabase-js';
import { fetchStoreId } from '@/api/auth';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

interface AuthState {
  session: Session | null;
  storeId: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setStoreId: (id: string) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      storeId: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Fetch store_id from backend so it's restored even after logout
        let storeId: string | null = null;
        try {
          storeId = await fetchStoreId();
        } catch {
          // ignore — user will be sent to onboarding if storeId stays null
        }
        set({ session: data.session, storeId });
      },

      signUp: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        set({ session: data.session, storeId: null });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, storeId: null });
      },

      setStoreId: (id: string) => set({ storeId: id }),
      setSession: (session: Session | null) => set({ session }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'kirana-auth',
      partialize: (s) => ({ storeId: s.storeId }),
    }
  )
);
