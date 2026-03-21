import { create } from 'zustand';
import type { SaleItem, LowStockItem } from '../types/sale';
import type { ReorderDraft } from '../types/vendor';

interface ReorderItem {
  skuId: string;
  name: string;
  draft: ReorderDraft | null;
  loading: boolean;
}

interface SaleState {
  items: SaleItem[];
  saleId: string | null;
  totalAmount: number;
  lowStockItems: LowStockItem[];
  reorderItems: ReorderItem[];
  paymentStatus: 'idle' | 'waiting' | 'paid';

  setItems: (items: SaleItem[]) => void;
  updateItem: (index: number, item: SaleItem) => void;
  removeItem: (index: number) => void;
  setSaleId: (id: string) => void;
  setTotalAmount: (amount: number) => void;
  setLowStockItems: (items: LowStockItem[]) => void;
  setReorderDraft: (skuId: string, draft: ReorderDraft | null, loading: boolean) => void;
  setPaymentStatus: (status: 'idle' | 'waiting' | 'paid') => void;
  reset: () => void;
}

const initialState = {
  items: [],
  saleId: null,
  totalAmount: 0,
  lowStockItems: [],
  reorderItems: [],
  paymentStatus: 'idle' as const,
};

export const useSaleStore = create<SaleState>()((set, get) => ({
  ...initialState,

  setItems: (items) => set({ items }),

  updateItem: (index, item) => {
    const items = [...get().items];
    items[index] = item;
    set({ items });
  },

  removeItem: (index) => {
    const items = get().items.filter((_, i) => i !== index);
    set({ items });
  },

  setSaleId: (id) => set({ saleId: id }),
  setTotalAmount: (amount) => set({ totalAmount: amount }),
  setLowStockItems: (items) => {
    const reorderItems: ReorderItem[] = items.map((item) => ({
      skuId: item.sku_id,
      name: item.name,
      draft: null,
      loading: false,
    }));
    set({ lowStockItems: items, reorderItems });
  },

  setReorderDraft: (skuId, draft, loading) => {
    const reorderItems = get().reorderItems.map((r) =>
      r.skuId === skuId ? { ...r, draft, loading } : r
    );
    set({ reorderItems });
  },

  setPaymentStatus: (status) => set({ paymentStatus: status }),

  reset: () => set(initialState),
}));
