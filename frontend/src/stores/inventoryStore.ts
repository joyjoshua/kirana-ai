import { create } from 'zustand';
import type { InventoryItem } from '../types/inventory';
import { getInventory } from '../api/inventory';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface InventoryState {
  items: InventoryItem[];
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  fetchInventory: (storeId: string, force?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [],
  lastFetched: null,
  isLoading: false,
  error: null,

  fetchInventory: async (storeId: string, force = false) => {
    const { lastFetched, isLoading } = get();
    const now = Date.now();

    if (!force && lastFetched && now - lastFetched < CACHE_TTL && !isLoading) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const result = await getInventory(storeId);
      const items = Array.isArray(result) ? result : [];
      set({ items, lastFetched: Date.now(), isLoading: false });
    } catch (err) {
      set({ error: 'Failed to load inventory', isLoading: false });
      throw err;
    }
  },

  clearCache: () => set({ lastFetched: null }),
}));
