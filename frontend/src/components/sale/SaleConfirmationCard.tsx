import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SaleItemRow } from './SaleItemRow';
import type { SaleItem } from '@/types/sale';
import { formatCurrency } from '@/utils/formatCurrency';

interface SaleConfirmationCardProps {
  items: SaleItem[];
  loading?: boolean;
  onConfirm: () => void;
  onEdit: (index: number, item: SaleItem) => void;
  onRemove: (index: number) => void;
  onReRecord: () => void;
}

export function SaleConfirmationCard({
  items,
  loading = false,
  onConfirm,
  onEdit,
  onRemove,
  onReRecord,
}: SaleConfirmationCardProps) {
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
    >
      <Card elevated>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} color="#002970" />
              <span className="text-[22px] font-bold text-[#1C1C1E] tracking-[-0.26px]">Sale Summary</span>
            </div>
            <Badge variant="neutral">{items.length} item{items.length !== 1 ? 's' : ''}</Badge>
          </div>
        </CardHeader>

        {/* Items */}
        <div className="mb-4">
          {items.map((item, i) => (
            <SaleItemRow key={`${item.sku_id ?? item.name}-${i}`} item={item} index={i} onUpdate={onEdit} onRemove={onRemove} />
          ))}
        </div>

        {/* Total */}
        <div
          className="flex items-center justify-between pt-4 mb-5"
          style={{ borderTop: '1px solid rgba(198, 198, 200, 0.5)' }}
        >
          <span className="text-[17px] font-semibold text-[#1C1C1E] tracking-[-0.43px]">Total</span>
          <span className="text-[28px] font-bold text-[#1C1C1E] tracking-[-0.4px]">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            className="w-full"
            loading={loading}
            onClick={onConfirm}
            disabled={items.length === 0}
          >
            Confirm Sale
          </Button>
          <Button variant="ghost" className="w-full" onClick={onReRecord}>
            Re-record
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
