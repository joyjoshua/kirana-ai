import { useEffect, useState } from 'react';
import { Package, RefreshCw, Plus, X, Check, Pencil, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, EmptyState, PageContainer } from '@/components/shared/Layout';
import { SectionHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonBlock } from '@/components/shared/LoadingSpinner';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuthStore } from '@/stores/authStore';
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/api/inventory';
import { formatCurrency } from '@/utils/formatCurrency';
import type { InventoryItem } from '@/types/inventory';
import { showToast } from '@/components/shared/Toast';

const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'dozen', 'box', 'pack'];

// ─── Types ────────────────────────────────────────────────────────────────────

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

function emptyDraft(item?: InventoryItem): ItemDraft {
  if (item) {
    return {
      name: item.name,
      sale_price: String(item.sale_price),
      stock_qty: String(item.stock_qty),
      unit: item.unit,
    };
  }
  return { name: '', sale_price: '', stock_qty: '', unit: 'pcs' };
}

function validateDraft(draft: ItemDraft): ItemErrors {
  const e: ItemErrors = {};
  if (!draft.name.trim()) e.name = 'Required';
  if (!draft.sale_price || isNaN(Number(draft.sale_price)) || Number(draft.sale_price) < 0)
    e.sale_price = 'Invalid';
  if (!draft.stock_qty || isNaN(Number(draft.stock_qty)) || Number(draft.stock_qty) < 0)
    e.stock_qty = 'Invalid';
  return e;
}

function stockColor(item: InventoryItem): string {
  if (item.stock_qty === 0) return '#E53935';
  if (item.stock_qty <= item.reorder_threshold) return '#F5A623';
  return '#00C48C';
}

// ─── Unit Strip ───────────────────────────────────────────────────────────────

function UnitStrip({ value, onChange }: { value: string; onChange: (u: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {UNITS.map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className="h-8 w-14 rounded-[4px] text-[13px] font-medium transition-all duration-[80ms] flex items-center justify-center gap-1"
          style={{
            backgroundColor: value === u ? '#002970' : 'rgba(120,120,128,0.10)',
            color: value === u ? 'white' : '#1C1C1E',
          }}
        >
          {value === u && <Check size={11} strokeWidth={2.5} />}
          {u}
        </button>
      ))}
    </div>
  );
}

// ─── Table Header ─────────────────────────────────────────────────────────────

function TableHeader() {
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: '1fr 88px 68px 72px', padding: '8px 20px', borderBottom: '1px solid rgba(198,198,200,0.5)' }}
    >
      <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.4px]">Item</span>
      <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.4px] text-right">Stock</span>
      <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.4px] text-right">Price</span>
      <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.4px] text-right pr-1">Actions</span>
    </div>
  );
}

// ─── View Row ─────────────────────────────────────────────────────────────────

function ViewRow({
  item,
  isFirst,
  isDeleteTarget,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  item: InventoryItem;
  isFirst: boolean;
  isDeleteTarget: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backgroundColor: isDeleteTarget ? 'rgba(229,57,53,0.05)' : 'transparent' }}
      className="grid items-center"
      style={{
        gridTemplateColumns: '1fr 88px 68px 72px',
        padding: '16px 20px',
        borderTop: isFirst ? 'none' : '0.5px solid rgba(198,198,200,0.4)',
        transition: 'background-color 0.15s',
      }}
    >
      {/* Name + stock dot */}
      <div className="flex items-center gap-2 min-w-0 pr-2">
        <div
          className="shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: stockColor(item) }}
        />
        <span className="text-[15px] font-medium text-[#1C1C1E] tracking-[-0.23px] truncate">
          {item.name}
        </span>
      </div>

      {/* Stock qty */}
      <span
        className="text-[14px] font-semibold text-right tracking-[-0.2px]"
        style={{ color: stockColor(item) }}
      >
        {item.stock_qty} <span className="font-normal text-[#8E8E93]">{item.unit}</span>
      </span>

      {/* Price */}
      <span className="text-[14px] font-semibold text-[#1C1C1E] text-right tracking-[-0.2px]">
        {formatCurrency(item.sale_price)}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
        {isDeleteTarget ? (
          <>
            <button
              type="button"
              onClick={onConfirmDelete}
              aria-label="Confirm delete"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(229,57,53,0.12)', color: '#E53935' }}
            >
              <Check size={14} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              aria-label="Cancel delete"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'rgba(120,120,128,0.10)', color: '#8E8E93' }}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit item"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#002970' }}
            >
              <Pencil size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete item"
              style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#8E8E93' }}
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Edit Row ─────────────────────────────────────────────────────────────────

function EditRow({
  draft,
  errors,
  saving,
  onChange,
  onSave,
  onCancel,
}: {
  draft: ItemDraft;
  errors: ItemErrors;
  saving: boolean;
  onChange: (field: keyof ItemDraft, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-3"
      style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(0,41,112,0.03)',
        borderTop: '0.5px solid rgba(0,41,112,0.15)',
        borderBottom: '0.5px solid rgba(0,41,112,0.15)',
      }}
    >
      {/* Name */}
      <input
        type="text"
        value={draft.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="Item name"
        className="w-full h-10 rounded-[10px] text-[15px] text-[#1C1C1E] placeholder-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#002970] transition-all"
        style={{
          backgroundColor: errors.name ? 'rgba(229,57,53,0.08)' : 'rgba(120,120,128,0.10)',
          paddingLeft: 20,
        }}
        autoFocus
      />

      {/* Price + Qty */}
      <div className="flex gap-2">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.4px]">Price ₹</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            value={draft.sale_price}
            onChange={(e) => onChange('sale_price', e.target.value)}
            className="w-full h-10 rounded-[10px] text-[15px] text-[#1C1C1E] placeholder-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#002970] transition-all"
            style={{
              backgroundColor: errors.sale_price ? 'rgba(229,57,53,0.08)' : 'rgba(120,120,128,0.10)',
              paddingLeft: 20,
            }}
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.4px]">Qty</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={draft.stock_qty}
            onChange={(e) => onChange('stock_qty', e.target.value)}
            className="w-full h-10 rounded-[10px] text-[15px] text-[#1C1C1E] placeholder-[#AEAEB2] outline-none focus:ring-2 focus:ring-[#002970] transition-all"
            style={{
              backgroundColor: errors.stock_qty ? 'rgba(229,57,53,0.08)' : 'rgba(120,120,128,0.10)',
              paddingLeft: 20,
            }}
          />
        </div>
      </div>

      {/* Unit */}
      <UnitStrip value={draft.unit} onChange={(u) => onChange('unit', u)} />

      {/* Save / Cancel */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-full text-[14px] font-semibold text-white flex items-center justify-center gap-1.5 transition-opacity"
          style={{ height: 40, backgroundColor: '#002970', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : <><Check size={14} strokeWidth={2.5} /> Save</>}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full text-[14px] font-semibold text-[#1C1C1E] flex items-center justify-center transition-colors"
          style={{ height: 40, padding: '0 24px', backgroundColor: 'rgba(120,120,128,0.12)' }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ─── Add Item Sheet ───────────────────────────────────────────────────────────

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validateDraft(draft);
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
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
    <div
      className="fixed inset-0 z-50 flex justify-center items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 32 }}
        className="w-full overflow-hidden"
        style={{ maxWidth: '520px', maxHeight: '92dvh', borderRadius: '28px 28px 0 0', backgroundColor: '#fff' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-[5px] rounded-full" style={{ backgroundColor: '#D1D1D6' }} />
        </div>

        <div className="flex items-center justify-between" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(198,198,200,0.4)' }}>
          <h2 className="text-[20px] font-bold text-[#1C1C1E] tracking-[-0.45px]">Add Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#8E8E93]"
            style={{ backgroundColor: 'rgba(120,120,128,0.12)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ padding: '20px 20px 24px', maxHeight: 'calc(92dvh - 120px)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Input
              label="Item name"
              placeholder="e.g. Parle-G Biscuits"
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
              autoFocus
            />

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-[6px]">
                <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">Price (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  min="0"
                  value={draft.sale_price}
                  onChange={(e) => update('sale_price', e.target.value)}
                  className="w-full h-[54px] rounded-[14px] text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px] outline-none focus:ring-2 focus:ring-[#002970] focus:bg-white transition-all duration-[150ms]"
                  style={{ backgroundColor: errors.sale_price ? 'rgba(229,57,53,0.06)' : 'rgba(120,120,128,0.10)', paddingLeft: 20 }}
                />
                {errors.sale_price && <p className="text-[13px] text-[#E53935]">{errors.sale_price}</p>}
              </div>

              <div className="flex-1 flex flex-col gap-[6px]">
                <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">Stock qty</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  min="0"
                  value={draft.stock_qty}
                  onChange={(e) => update('stock_qty', e.target.value)}
                  className="w-full h-[54px] rounded-[14px] text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px] outline-none focus:ring-2 focus:ring-[#002970] focus:bg-white transition-all duration-[150ms]"
                  style={{ backgroundColor: errors.stock_qty ? 'rgba(229,57,53,0.06)' : 'rgba(120,120,128,0.10)', paddingLeft: 20 }}
                />
                {errors.stock_qty && <p className="text-[13px] text-[#E53935]">{errors.stock_qty}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">Unit</label>
              <UnitStrip value={draft.unit} onChange={(u) => update('unit', u)} />
            </div>

            <Button type="submit" variant="primary" className="w-full rounded-full mt-2" loading={loading}>
              Add Item
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Inventory Table ──────────────────────────────────────────────────────────

function InventoryTable({
  items,
  onMutated,
}: {
  items: InventoryItem[];
  onMutated: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ItemDraft>(emptyDraft());
  const [editErrors, setEditErrors] = useState<ItemErrors>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const startEdit = (item: InventoryItem) => {
    setDeleteTargetId(null);
    setEditingId(item.id);
    setEditDraft(emptyDraft(item));
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditErrors({});
  };

  const saveEdit = async () => {
    const errs = validateDraft(editDraft);
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setSavingId(editingId);
    try {
      await updateInventoryItem(editingId!, {
        name: editDraft.name.trim(),
        sale_price: Number(editDraft.sale_price),
        stock_qty: Number(editDraft.stock_qty),
        unit: editDraft.unit,
      });
      showToast('Item updated', 'success');
      setEditingId(null);
      onMutated();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    setSavingId(deleteTargetId);
    try {
      await deleteInventoryItem(deleteTargetId);
      showToast('Item deleted', 'success');
      setDeleteTargetId(null);
      onMutated();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const lowStockItems = items.filter((i) => i.stock_qty <= i.reorder_threshold);

  return (
    <div className="flex flex-col gap-4">
      {/* Low stock warning */}
      {lowStockItems.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-[14px]"
          style={{ backgroundColor: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          <span className="text-[18px]">⚠️</span>
          <span className="text-[14px] font-medium text-[#7B5800]">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need restocking
          </span>
        </div>
      )}

      {/* Table card */}
      <div
        className="bg-white overflow-hidden"
        style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(198,198,200,0.5)' }}>
          <SectionHeader className="mb-0">All items ({items.length})</SectionHeader>
        </div>

        <TableHeader />

        <AnimatePresence>
          {items.map((item, i) => (
            editingId === item.id ? (
              <EditRow
                key={item.id}
                draft={editDraft}
                errors={editErrors}
                saving={savingId === item.id}
                onChange={(field, value) => {
                  setEditDraft((prev) => ({ ...prev, [field]: value }));
                  setEditErrors((prev) => ({ ...prev, [field]: undefined }));
                }}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <ViewRow
                key={item.id}
                item={item}
                isFirst={i === 0}
                isDeleteTarget={deleteTargetId === item.id}
                onEdit={() => startEdit(item)}
                onDelete={() => { setEditingId(null); setDeleteTargetId(item.id); }}
                onConfirmDelete={confirmDelete}
                onCancelDelete={() => setDeleteTargetId(null)}
              />
            )
          ))}
        </AnimatePresence>

        {/* Footer */}
        <div
          className="flex items-center justify-between"
          style={{ padding: '16px 20px', borderTop: '0.5px solid rgba(198,198,200,0.5)' }}
        >
          <span className="text-[12px] text-[#8E8E93]">{items.length} items total</span>
          <span className="text-[12px] text-[#8E8E93]">
            {lowStockItems.length > 0 ? `${lowStockItems.length} low stock` : 'All stocked'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

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

  const handleMutated = () => {
    if (storeId) {
      clearCache();
      void fetchInventory(storeId, true);
    }
  };

  const handleAdded = () => {
    setShowSheet(false);
    handleMutated();
  };

  return (
    <>
      <Layout
        title="Inventory"
        rightAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Refresh"
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#002970] active:bg-[#EEF3FA] transition-colors"
            >
              <RefreshCw size={18} strokeWidth={2} />
            </button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSheet(true)}
              aria-label="Add item"
              className="rounded-full"
              style={{ paddingLeft: 20, paddingRight: 20 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add
            </Button>
          </div>
        }
      >
        <PageContainer>
          {isLoading ? (
            <div
              className="rounded-[20px] bg-white overflow-hidden"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)' }}
            >
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3"
                  style={i > 0 ? { borderTop: '0.5px solid rgba(198,198,200,0.4)' } : undefined}
                >
                  <SkeletonBlock style={{ width: 130, height: 16 }} />
                  <SkeletonBlock style={{ width: 60, height: 16 }} />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<Package size={56} />}
              title="No inventory yet"
              description='Tap Add to add your first product.'
              action={
                <Button
                  variant="primary"
                  className="rounded-full gap-2 mt-2"
                  onClick={() => setShowSheet(true)}
                >
                  <Plus size={18} />
                  Add first item
                </Button>
              }
            />
          ) : (
            <InventoryTable
                items={items}
                onMutated={handleMutated}
              />
          )}
        </PageContainer>
      </Layout>

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
