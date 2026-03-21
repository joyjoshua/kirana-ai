import { useEffect, useState } from 'react';
import { Package, RefreshCw, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, EmptyState, PageContainer } from '@/components/shared/Layout';
import { Card, SectionHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonBlock } from '@/components/shared/LoadingSpinner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuthStore } from '@/stores/authStore';
import { createInventoryItem } from '@/api/inventory';
import { formatCurrency } from '@/utils/formatCurrency';
import type { InventoryItem } from '@/types/inventory';
import { showToast } from '@/components/shared/Toast';

const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'dozen', 'box', 'pack'];

interface ItemDraft {
  name: string;
  sale_price: string;
  stock_qty: string;
  unit: string;
}

interface ItemErrors {
  name?: string;
  sale_price?: string;
  stock_qty?: string;
}

function emptyDraft(): ItemDraft {
  return { name: '', sale_price: '', stock_qty: '', unit: 'pcs' };
}

function stockBadgeVariant(item: InventoryItem) {
  if (item.stock_qty === 0) return 'error';
  if (item.stock_qty <= item.reorder_threshold) return 'warning';
  return 'success';
}

function stockLabel(item: InventoryItem) {
  if (item.stock_qty === 0) return 'Out of Stock';
  if (item.stock_qty <= item.reorder_threshold) return `Low: ${item.stock_qty} ${item.unit}`;
  return `${item.stock_qty} ${item.unit}`;
}

// ── Add Item Sheet ────────────────────────────────────────────────────────────

function AddItemSheet({
  storeId,
  onClose,
  onAdded,
}: {
  storeId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft());
  const [errors, setErrors] = useState<ItemErrors>({});
  const [loading, setLoading] = useState(false);

  const update = (field: keyof ItemDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: ItemErrors = {};
    if (!draft.name.trim()) e.name = 'Item name is required';
    if (!draft.sale_price || isNaN(Number(draft.sale_price)) || Number(draft.sale_price) < 0)
      e.sale_price = 'Enter a valid price';
    if (!draft.stock_qty || isNaN(Number(draft.stock_qty)) || Number(draft.stock_qty) < 0)
      e.stock_qty = 'Enter valid qty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createInventoryItem({
        store_id: storeId,
        name: draft.name.trim(),
        sale_price: Number(draft.sale_price),
        cost_price: 0,
        stock_qty: Number(draft.stock_qty),
        unit: draft.unit,
        reorder_threshold: 5,
        reorder_qty: 10,
        aliases: [],
      });
      showToast(`${draft.name.trim()} added`, 'success');
      onAdded();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not add item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full max-w-[480px] mx-auto rounded-t-[28px] bg-white overflow-hidden"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#C7C7CC]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(198,198,200,0.4)' }}>
          <h2 className="text-[20px] font-bold text-[#1C1C1E] tracking-[-0.45px]">Add Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full active:bg-[rgba(120,120,128,0.12)] text-[#8E8E93]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto px-5 pt-5 pb-8" style={{ maxHeight: 'calc(92dvh - 120px)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input
              label="Item name"
              placeholder="e.g. Parle-G Biscuits"
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
              autoFocus
            />

            {/* Price + Qty row */}
            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-[6px]">
                <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">
                  Price (₹)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  min="0"
                  value={draft.sale_price}
                  onChange={(e) => update('sale_price', e.target.value)}
                  className="w-full h-[54px] rounded-[14px] px-4 text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px] outline-none focus:ring-2 focus:ring-[#002970] focus:bg-white transition-all duration-[150ms]"
                  style={{ backgroundColor: errors.sale_price ? 'rgba(229,57,53,0.06)' : 'rgba(120,120,128,0.10)' }}
                />
                {errors.sale_price && (
                  <p className="text-[13px] text-[#E53935]">{errors.sale_price}</p>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-[6px]">
                <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">
                  Stock qty
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  min="0"
                  value={draft.stock_qty}
                  onChange={(e) => update('stock_qty', e.target.value)}
                  className="w-full h-[54px] rounded-[14px] px-4 text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px] outline-none focus:ring-2 focus:ring-[#002970] focus:bg-white transition-all duration-[150ms]"
                  style={{ backgroundColor: errors.stock_qty ? 'rgba(229,57,53,0.06)' : 'rgba(120,120,128,0.10)' }}
                />
                {errors.stock_qty && (
                  <p className="text-[13px] text-[#E53935]">{errors.stock_qty}</p>
                )}
              </div>
            </div>

            {/* Unit selector */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">Unit</label>
              <div className="flex flex-wrap gap-2">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => update('unit', u)}
                    className="h-9 px-4 rounded-full text-[13px] font-semibold transition-all duration-[80ms]"
                    style={{
                      backgroundColor: draft.unit === u ? '#002970' : 'rgba(120,120,128,0.10)',
                      color: draft.unit === u ? 'white' : '#1C1C1E',
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full rounded-full mt-1" loading={loading}>
              Add Item
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const { items, isLoading, fetchInventory, clearCache } = useInventoryStore();
  const { storeId } = useAuthStore();
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (storeId) void fetchInventory(storeId);
  }, [storeId, fetchInventory]);

  const handleRefresh = async () => {
    if (!storeId) return;
    clearCache();
    try {
      await fetchInventory(storeId, true);
      showToast('Inventory updated', 'success');
    } catch {
      showToast('Could not refresh inventory', 'error');
    }
  };

  const handleAdded = () => {
    setShowSheet(false);
    if (storeId) {
      clearCache();
      void fetchInventory(storeId, true);
    }
  };

  const lowStockItems = items.filter((i) => i.stock_qty <= i.reorder_threshold);
  const okItems = items.filter((i) => i.stock_qty > i.reorder_threshold);

  return (
    <>
      <Layout
        title="Inventory"
        rightAction={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh} aria-label="Refresh">
              <RefreshCw size={18} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSheet(true)}
              aria-label="Add item"
              className="rounded-full gap-1"
            >
              <Plus size={16} />
              Add
            </Button>
          </div>
        }
      >
        <PageContainer>
          {isLoading ? (
            <Card>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3"
                  style={i > 0 ? { borderTop: '1px solid rgba(198,198,200,0.5)' } : undefined}
                >
                  <div className="flex flex-col gap-2">
                    <SkeletonBlock style={{ width: 120, height: 17 }} />
                    <SkeletonBlock style={{ width: 60, height: 13 }} />
                  </div>
                  <SkeletonBlock style={{ width: 80, height: 24 }} />
                </div>
              ))}
            </Card>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 px-4">
              <div className="text-[#C7C7CC]"><Package size={64} /></div>
              <h2 className="text-[22px] font-bold text-[#1C1C1E] text-center">No inventory yet</h2>
              <p className="text-[17px] text-[#8E8E93] text-center max-w-[260px]">
                Tap <strong>Add</strong> to add your first product.
              </p>
              <Button
                variant="primary"
                className="rounded-full gap-2 mt-2"
                onClick={() => setShowSheet(true)}
              >
                <Plus size={18} />
                Add first item
              </Button>
            </div>
          ) : (
            <>
              {lowStockItems.length > 0 && (
                <Card>
                  <SectionHeader>Needs attention</SectionHeader>
                  {lowStockItems.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3"
                      style={i > 0 ? { borderTop: '1px solid rgba(198,198,200,0.5)' } : undefined}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] text-[#1C1C1E] tracking-[-0.43px] truncate">{item.name}</p>
                        <Badge variant={stockBadgeVariant(item)} className="mt-1">{stockLabel(item)}</Badge>
                      </div>
                      <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px] shrink-0 ml-3">
                        {formatCurrency(item.sale_price)}
                      </p>
                    </div>
                  ))}
                </Card>
              )}

              <Card>
                <SectionHeader>All items ({items.length})</SectionHeader>
                {okItems.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3"
                    style={i > 0 ? { borderTop: '1px solid rgba(198,198,200,0.5)' } : undefined}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[17px] text-[#1C1C1E] tracking-[-0.43px] truncate">{item.name}</p>
                      <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px] mt-0.5">
                        {item.stock_qty} {item.unit} in stock
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-3">
                      <p className="text-[17px] font-semibold text-[#1C1C1E] tracking-[-0.43px]">
                        {formatCurrency(item.sale_price)}
                      </p>
                      <Badge variant="success">{stockLabel(item)}</Badge>
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}
        </PageContainer>
      </Layout>

      {/* Add Item sheet */}
      <AnimatePresence>
        {showSheet && storeId && (
          <AddItemSheet
            storeId={storeId}
            onClose={() => setShowSheet(false)}
            onAdded={handleAdded}
          />
        )}
      </AnimatePresence>
    </>
  );
}
