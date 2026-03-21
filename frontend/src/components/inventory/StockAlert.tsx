import { AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { LowStockItem } from '@/types/sale';

interface StockAlertProps {
  item: LowStockItem;
  onReorder: (skuId: string) => void;
  loading?: boolean;
}

export function StockAlert({ item, onReorder, loading = false }: StockAlertProps) {
  const isOut = item.current_qty === 0;

  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '1px solid rgba(198, 198, 200, 0.5)' }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isOut ? (
          <XCircle size={20} color="#E53935" />
        ) : (
          <AlertTriangle size={20} color="#B87313" />
        )}
        <div className="min-w-0">
          <p className="text-[17px] text-[#1C1C1E] tracking-[-0.43px] truncate">{item.name}</p>
          <Badge variant={isOut ? 'error' : 'warning'} className="mt-1">
            {isOut ? 'Out of Stock' : `Low: ${item.current_qty} left`}
          </Badge>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={() => onReorder(item.sku_id)}
        className="shrink-0 ml-3"
      >
        Reorder
      </Button>
    </div>
  );
}
