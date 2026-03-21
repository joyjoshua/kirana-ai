import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Store, Phone, CreditCard, Check, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { setupStore } from '@/api/auth';
import { createInventoryItem } from '@/api/inventory';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/shared/Toast';

type Step = 'store' | 'inventory' | 'done';

interface StoreForm {
  owner_name: string;
  store_name: string;
  phone: string;
  upi_vpa: string;
}

interface StoreErrors {
  owner_name?: string;
  store_name?: string;
  phone?: string;
  upi_vpa?: string;
}

interface ItemDraft {
  name: string;
  sale_price: string;
  stock_qty: string;
  unit: string;
}

interface ItemError {
  name?: string;
  sale_price?: string;
  stock_qty?: string;
}

const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'dozen', 'box', 'pack'];

function emptyItem(): ItemDraft {
  return { name: '', sale_price: '', stock_qty: '', unit: 'pcs' };
}

function validatePhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
}

function validateUpiVpa(vpa: string): boolean {
  return /^[\w.\-+]+@[\w]+$/.test(vpa);
}

// ── Step indicator ──────────────────────────────────────────────────────────

function StepDot({ num, status, label }: { num: number; status: 'active' | 'done' | 'future'; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: status === 'done' ? '#00C48C' : status === 'active' ? '#002970' : 'transparent',
          border: status === 'future' ? '2px solid #E5E7EB' : 'none',
        }}
      >
        {status === 'done' ? (
          <Check size={16} color="white" strokeWidth={2.5} />
        ) : (
          <span
            className="text-[13px] font-bold"
            style={{ color: status === 'active' ? 'white' : '#AEAEB2' }}
          >
            {num}
          </span>
        )}
      </div>
      <span
        className="text-[11px] font-semibold tracking-[0.07px]"
        style={{ color: status === 'active' ? '#002970' : status === 'done' ? '#00C48C' : '#AEAEB2' }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('store');
  const [storeId, setStoreIdLocal] = useState<string | null>(null);
  const [loadingStore, setLoadingStore] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  const [storeForm, setStoreForm] = useState<StoreForm>({
    owner_name: '', store_name: '', phone: '', upi_vpa: '',
  });
  const [storeErrors, setStoreErrors] = useState<StoreErrors>({});

  const [items, setItems] = useState<ItemDraft[]>([emptyItem()]);
  const [itemErrors, setItemErrors] = useState<ItemError[]>([{}]);

  const navigate = useNavigate();
  const setStoreId = useAuthStore((s) => s.setStoreId);

  // ── Store step ─────────────────────────────────────────────────────────────

  const updateStore = (field: keyof StoreForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setStoreForm((prev) => ({ ...prev, [field]: e.target.value }));
    setStoreErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStore = (): boolean => {
    const errs: StoreErrors = {};
    if (!storeForm.owner_name.trim()) errs.owner_name = 'Owner name is required';
    if (!storeForm.store_name.trim()) errs.store_name = 'Store name is required';
    if (!validatePhone(storeForm.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!validateUpiVpa(storeForm.upi_vpa)) errs.upi_vpa = 'Enter a valid UPI VPA (e.g., yourname@upi)';
    setStoreErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStore()) return;
    setLoadingStore(true);
    try {
      const { store_id } = await setupStore({
        ...storeForm,
        phone: `+91${storeForm.phone.replace(/\s/g, '')}`,
        preferred_language: 'hi',
      });
      setStoreId(store_id);
      setStoreIdLocal(store_id);
      setStep('inventory');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not create store', 'error');
    } finally {
      setLoadingStore(false);
    }
  };

  // ── Inventory step ──────────────────────────────────────────────────────────

  const updateItem = (index: number, field: keyof ItemDraft, value: string) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    setItemErrors((prev) => prev.map((err, i) => i === index ? { ...err, [field]: undefined } : err));
  };

  const addItem = () => {
    setItems((prev) => [...prev, emptyItem()]);
    setItemErrors((prev) => [...prev, {}]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setItemErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const validateItems = (): boolean => {
    const errs: ItemError[] = items.map((item) => {
      const e: ItemError = {};
      if (!item.name.trim()) e.name = 'Item name required';
      if (!item.sale_price || isNaN(Number(item.sale_price)) || Number(item.sale_price) < 0) {
        e.sale_price = 'Enter a valid price';
      }
      if (!item.stock_qty || isNaN(Number(item.stock_qty)) || Number(item.stock_qty) < 0) {
        e.stock_qty = 'Enter valid qty';
      }
      return e;
    });
    setItemErrors(errs);
    return errs.every((e) => Object.keys(e).length === 0);
  };

  const handleInventorySubmit = async () => {
    if (!storeId) return;
    // If all items are empty, allow skipping
    const allEmpty = items.every((i) => !i.name.trim() && !i.sale_price && !i.stock_qty);
    if (!allEmpty && !validateItems()) return;

    setLoadingInventory(true);
    try {
      if (!allEmpty) {
        await Promise.all(
          items.map((item) =>
            createInventoryItem({
              store_id: storeId,
              name: item.name.trim(),
              sale_price: Number(item.sale_price),
              cost_price: 0,
              stock_qty: Number(item.stock_qty),
              unit: item.unit,
              reorder_threshold: 5,
              reorder_qty: 10,
              aliases: [],
            })
          )
        );
      }
      setStep('done');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Could not save items', 'error');
    } finally {
      setLoadingInventory(false);
    }
  };

  // ── Done screen ─────────────────────────────────────────────────────────────

  if (step === 'done') {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-6 gap-6"
        style={{ background: 'linear-gradient(160deg, #EEF3FA 0%, #F2F2F7 55%, #E8EFFD 100%)' }}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(140deg, #002970 0%, #1a4fa8 100%)',
              boxShadow: '0 6px 28px rgba(0,41,112,0.28)',
            }}
          >
            <Check size={44} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[28px] font-bold text-[#1C1C1E] tracking-[-0.4px]">Store is ready!</h1>
            <p className="text-[17px] text-[#8E8E93] mt-2 max-w-[260px]">
              You can now record sales with your voice.
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full max-w-[280px] mt-2 rounded-full"
            onClick={() => navigate('/', { replace: true })}
          >
            Start Selling
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Progress bar % ──────────────────────────────────────────────────────────
  const progressPct = step === 'store' ? 33 : step === 'inventory' ? 66 : 100;

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Full-width progress bar */}
      <div className="h-[3px] w-full" style={{ backgroundColor: 'rgba(0,41,112,0.12)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progressPct}%`, backgroundColor: '#002970' }}
        />
      </div>

      {/* Nav — full width with centered content */}
      <header
        className="w-full flex justify-center"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(60,60,67,0.10)',
        }}
      >
        <div className="w-full flex items-center justify-center px-6 h-14" style={{ maxWidth: '520px' }}>
          <span className="text-[17px] font-semibold text-[#1C1C1E] tracking-[-0.43px]">
            {step === 'store' ? 'Set Up Store' : 'Add Inventory'}
          </span>
        </div>
      </header>

      {/* Centered content column */}
      <div className="flex-1 flex justify-center w-full">
      <div className="flex-1 px-5 pb-10 w-full" style={{ maxWidth: '520px' }}>
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <StepDot num={1} status={step === 'store' ? 'active' : 'done'} label="Store" />
          <div className="flex-1 h-[2px] max-w-[60px] rounded-full" style={{ backgroundColor: step !== 'store' ? '#00C48C' : '#E5E7EB' }} />
          <StepDot num={2} status={step === 'inventory' ? 'active' : step === 'done' ? 'done' : 'future'} label="Inventory" />
          <div className="flex-1 h-[2px] max-w-[60px] rounded-full bg-[#E5E7EB]" />
          <StepDot num={3} status="future" label="Done" />
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Store ─────────────────────────────────────────────── */}
          {step === 'store' && (
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-6">
                <h1 className="text-[24px] font-bold text-[#1C1C1E] tracking-[-0.4px]">Set up your store</h1>
                <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px] mt-1">This takes 30 seconds</p>
              </div>

              <div className="rounded-[20px] bg-white p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}>
                <form onSubmit={handleStoreSubmit} className="flex flex-col gap-5" noValidate>
                  <Input label="Your name" placeholder="Ramesh Bhai" value={storeForm.owner_name} onChange={updateStore('owner_name')} error={storeErrors.owner_name} autoComplete="name" leftIcon={<User size={18} />} />
                  <Input label="Store name" placeholder="Ramesh General Store" value={storeForm.store_name} onChange={updateStore('store_name')} error={storeErrors.store_name} autoComplete="organization" leftIcon={<Store size={18} />} />
                  <Input label="Mobile number" type="tel" placeholder="9876543210" value={storeForm.phone} onChange={updateStore('phone')} error={storeErrors.phone} autoComplete="tel" inputMode="numeric" maxLength={10} leftIcon={<Phone size={18} />} />
                  <Input label="UPI VPA" placeholder="yourstore@upi" value={storeForm.upi_vpa} onChange={updateStore('upi_vpa')} error={storeErrors.upi_vpa} autoCapitalize="none" helper="Customers will pay to this UPI ID" leftIcon={<CreditCard size={18} />} />
                  <Button type="submit" variant="primary" className="w-full mt-1 rounded-full" loading={loadingStore}>
                    Next: Add Inventory
                  </Button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Inventory ─────────────────────────────────────────── */}
          {step === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-4"
            >
              <div className="mb-2">
                <h1 className="text-[24px] font-bold text-[#1C1C1E] tracking-[-0.4px]">Add inventory</h1>
                <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px] mt-1">
                  Add the items you sell. You can add more later.
                </p>
              </div>

              {/* Item cards */}
              {items.map((item, index) => (
                <div
                  key={index}
                  className="rounded-[20px] bg-white p-5"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)' }}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[12px] font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(0,41,112,0.1)', color: '#002970' }}
                    >
                      #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-[#E53935] active:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    {/* Item name */}
                    <Input
                      label="Item name"
                      placeholder="e.g. Parle-G Biscuits"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      error={itemErrors[index]?.name}
                    />

                    {/* Price + Stock row */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px] block mb-[6px]">
                          Price (₹)
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          min="0"
                          value={item.sale_price}
                          onChange={(e) => updateItem(index, 'sale_price', e.target.value)}
                          className="w-full h-[54px] rounded-[14px] text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px] outline-none focus:ring-2 focus:ring-[#002970] focus:bg-white transition-all duration-[150ms]"
                          style={{ backgroundColor: itemErrors[index]?.sale_price ? 'rgba(229,57,53,0.06)' : 'rgba(120,120,128,0.10)', paddingLeft: 20 }}
                        />
                        {itemErrors[index]?.sale_price && (
                          <p className="text-[13px] text-[#E53935] mt-1">{itemErrors[index].sale_price}</p>
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px] block mb-[6px]">
                          Stock qty
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          min="0"
                          value={item.stock_qty}
                          onChange={(e) => updateItem(index, 'stock_qty', e.target.value)}
                          className="w-full h-[54px] rounded-[14px] px-4 text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px] outline-none focus:ring-2 focus:ring-[#002970] focus:bg-white transition-all duration-[150ms]"
                          style={{ backgroundColor: itemErrors[index]?.stock_qty ? 'rgba(229,57,53,0.06)' : 'rgba(120,120,128,0.10)', paddingLeft: 20 }}
                        />
                        {itemErrors[index]?.stock_qty && (
                          <p className="text-[13px] text-[#E53935] mt-1">{itemErrors[index].stock_qty}</p>
                        )}
                      </div>
                    </div>

                    {/* Unit selector */}
                    <div>
                      <label className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px] block mb-[6px]">
                        Unit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {UNITS.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => updateItem(index, 'unit', u)}
                            className="h-9 px-4 rounded-full text-[13px] font-semibold transition-all duration-[80ms]"
                            style={{
                              backgroundColor: item.unit === u ? '#002970' : 'rgba(120,120,128,0.10)',
                              color: item.unit === u ? 'white' : '#1C1C1E',
                            }}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add item button */}
              <button
                type="button"
                onClick={addItem}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-[14px] text-[15px] font-semibold text-[#002970] border-2 border-dashed border-[#002970]/30 active:bg-[#002970]/5 transition-all duration-[80ms]"
              >
                <Plus size={18} />
                Add another item
              </button>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('store')}
                  className="text-[15px] font-semibold text-[#8E8E93] active:text-[#1C1C1E]"
                >
                  Previous
                </button>
                <Button
                  variant="primary"
                  className="rounded-full px-8"
                  loading={loadingInventory}
                  onClick={handleInventorySubmit}
                >
                  {items.every((i) => !i.name.trim()) ? 'Skip for now' : 'Continue'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
}
