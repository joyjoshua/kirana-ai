import { useEffect, useState, useCallback } from 'react';
import { ShoppingBag, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, EmptyState, PageContainer } from '@/components/shared/Layout';
import { SectionHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonBlock } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/stores/authStore';
import { getSalesHistory } from '@/api/sales';
import { formatCurrency, formatCurrencyCompact } from '@/utils/formatCurrency';
import { showToast } from '@/components/shared/Toast';
import type { SaleHistory } from '@/types/sale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function groupByDate(sales: SaleHistory[]): { date: string; sales: SaleHistory[] }[] {
  const map = new Map<string, SaleHistory[]>();
  for (const sale of sales) {
    const key = formatDate(sale.created_at);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(sale);
  }
  return Array.from(map.entries()).map(([date, s]) => ({ date, sales: s }));
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ sales }: { sales: SaleHistory[] }) {
  const paid = sales.filter((s) => s.payment_status === 'paid');
  const total = paid.reduce((acc, s) => acc + s.total_amount, 0);
  const today = new Date().toDateString();
  const todayPaid = paid.filter((s) => new Date(s.created_at).toDateString() === today);
  const todayTotal = todayPaid.reduce((acc, s) => acc + s.total_amount, 0);

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ backgroundColor: '#002970', boxShadow: '0 4px 16px rgba(0,41,112,0.24)' }}
    >
      <div className="flex"  style={{ gap: 0 }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-[2px] py-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-white/60">Today</span>
          <span className="text-[22px] font-bold text-white tracking-[-0.5px]">
            {formatCurrencyCompact(todayTotal)}
          </span>
          <span className="text-[11px] text-white/50">{todayPaid.length} sale{todayPaid.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-[2px] py-5" style={{ borderLeft: '1px solid rgba(255,255,255,0.12)' }}>
          <span className="text-[11px] font-semibold uppercase tracking-[0.5px] text-white/60">All time</span>
          <span className="text-[22px] font-bold text-white tracking-[-0.5px]">
            {formatCurrencyCompact(total)}
          </span>
          <span className="text-[11px] text-white/50">{paid.length} sale{paid.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sale Card ────────────────────────────────────────────────────────────────

function SaleCard({ sale, isFirst }: { sale: SaleHistory; isFirst: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const statusVariant = sale.payment_status === 'paid'
    ? 'success'
    : sale.payment_status === 'failed'
      ? 'error'
      : 'warning';

  const statusLabel = sale.payment_status === 'paid'
    ? 'Paid'
    : sale.payment_status === 'failed'
      ? 'Failed'
      : 'Pending';

  return (
    <div style={{ borderTop: isFirst ? 'none' : '0.5px solid rgba(198,198,200,0.4)' }}>
      {/* Main row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 text-left transition-colors active:bg-[rgba(0,0,0,0.03)]"
        style={{ padding: '14px 20px' }}
      >
        {/* Icon */}
        <div
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: sale.payment_status === 'paid'
              ? 'rgba(0,196,140,0.12)'
              : 'rgba(245,166,35,0.12)',
          }}
        >
          <ShoppingBag
            size={16}
            strokeWidth={2}
            color={sale.payment_status === 'paid' ? '#00C48C' : '#F5A623'}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">
              {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
            </span>
            <Badge variant={statusVariant} className="!py-[3px] !px-2 !text-[10px]">{statusLabel}</Badge>
          </div>
          <span className="text-[13px] text-[#8E8E93]">{formatTime(sale.created_at)}</span>
        </div>

        {/* Amount + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[16px] font-bold text-[#1C1C1E] tracking-[-0.3px]">
            {formatCurrency(sale.total_amount)}
          </span>
          {expanded
            ? <ChevronUp size={16} strokeWidth={2} color="#8E8E93" />
            : <ChevronDown size={16} strokeWidth={2} color="#8E8E93" />
          }
        </div>
      </button>

      {/* Expanded items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="flex flex-col gap-0"
              style={{
                margin: '0 20px 14px',
                borderRadius: '12px',
                backgroundColor: 'rgba(120,120,128,0.06)',
                overflow: 'hidden',
              }}
            >
              {sale.items.map((item, i) => (
                <div
                  key={item.sku_id}
                  className="flex items-center justify-between"
                  style={{
                    padding: '10px 14px',
                    borderTop: i === 0 ? 'none' : '0.5px solid rgba(198,198,200,0.35)',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[13px] font-medium text-[#1C1C1E] truncate">{item.name}</span>
                    <span className="text-[12px] text-[#8E8E93] shrink-0">× {item.qty} {item.unit}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-[#1C1C1E] shrink-0 ml-2">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
              <div
                className="flex items-center justify-between"
                style={{ padding: '10px 14px', borderTop: '0.5px solid rgba(198,198,200,0.5)' }}
              >
                <span className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-[0.3px]">Total</span>
                <span className="text-[14px] font-bold text-[#002970]">{formatCurrency(sale.total_amount)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Date Group ───────────────────────────────────────────────────────────────

function DateGroup({ date, sales }: { date: string; sales: SaleHistory[] }) {
  const dayTotal = sales
    .filter((s) => s.payment_status === 'paid')
    .reduce((acc, s) => acc + s.total_amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <SectionHeader className="mb-0">{date}</SectionHeader>
        {dayTotal > 0 && (
          <span className="text-[12px] font-semibold text-[#00C48C]">{formatCurrency(dayTotal)}</span>
        )}
      </div>
      <div
        className="bg-white overflow-hidden"
        style={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)' }}
      >
        {sales.map((sale, i) => (
          <SaleCard key={sale.id} sale={sale} isFirst={i === 0} />
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SalesSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonBlock style={{ height: 96, borderRadius: 20 }} />
      <div className="rounded-[20px] bg-white overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-4"
            style={i > 0 ? { borderTop: '0.5px solid rgba(198,198,200,0.4)' } : undefined}
          >
            <SkeletonBlock style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div className="flex-1 flex flex-col gap-2">
              <SkeletonBlock style={{ width: 120, height: 14 }} />
              <SkeletonBlock style={{ width: 72, height: 12 }} />
            </div>
            <SkeletonBlock style={{ width: 64, height: 16 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const { storeId } = useAuthStore();
  const [sales, setSales] = useState<SaleHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!storeId) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await getSalesHistory(storeId);
      setSales(data);
    } catch {
      showToast('Could not load sales', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  useEffect(() => { void load(); }, [load]);

  const handleRefresh = async () => {
    await load(true);
    showToast('Sales updated', 'success');
  };

  const groups = groupByDate(sales);

  return (
    <Layout
      title="Sales"
      rightAction={
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh"
          className="w-10 h-10 flex items-center justify-center rounded-full text-[#002970] active:bg-[#EEF3FA] transition-colors"
        >
          <RefreshCw size={18} strokeWidth={2} />
        </button>
      }
    >
      <PageContainer>
        {isLoading ? (
          <SalesSkeleton />
        ) : sales.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={56} />}
            title="No sales yet"
            description="Sales will appear here after you record your first transaction."
          />
        ) : (
          <>
            <SummaryBar sales={sales} />
            {groups.map(({ date, sales: daySales }) => (
              <DateGroup key={date} date={date} sales={daySales} />
            ))}
          </>
        )}
      </PageContainer>
    </Layout>
  );
}
