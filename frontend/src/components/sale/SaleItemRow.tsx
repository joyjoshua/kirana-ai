import { useState } from 'react';
import { Trash2, Pencil, Check } from 'lucide-react';
import type { SaleItem } from '@/types/sale';
import { formatCurrency } from '@/utils/formatCurrency';
import { cn } from '@/lib/utils';

interface SaleItemRowProps {
  item: SaleItem;
  index: number;
  onUpdate: (index: number, item: SaleItem) => void;
  onRemove: (index: number) => void;
}

export function SaleItemRow({ item, index, onUpdate, onRemove }: SaleItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(String(item.qty));

  const handleSave = () => {
    const parsed = parseFloat(qty);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdate(index, { ...item, qty: parsed });
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-3',
        index > 0 && 'border-t'
      )}
      style={index > 0 ? { borderColor: 'rgba(198, 198, 200, 0.5)' } : undefined}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[17px] text-[#1C1C1E] tracking-[-0.43px] font-medium truncate">{item.name}</p>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-20 h-8 rounded-[8px] px-2 text-[15px] outline-none ring-2 ring-[#002970]"
              style={{ backgroundColor: 'rgba(120, 120, 128, 0.12)' }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <span className="text-[13px] text-[#8E8E93]">{item.unit}</span>
          </div>
        ) : (
          <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px] mt-0.5">
            {item.qty} {item.unit}
          </p>
        )}
      </div>

      <p className="text-[17px] font-semibold text-[#1C1C1E] tracking-[-0.43px] shrink-0">
        {formatCurrency(item.qty * item.price)}
      </p>

      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <button
            type="button"
            onClick={handleSave}
            aria-label="Save quantity"
            className="flex items-center justify-center w-9 h-9 rounded-full active:bg-[#E6F6F1]"
          >
            <Check size={18} color="#00A86B" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit quantity"
            className="flex items-center justify-center w-9 h-9 rounded-full active:bg-[#EEF3FA]"
          >
            <Pencil size={16} color="#002970" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove item"
          className="flex items-center justify-center w-9 h-9 rounded-full active:bg-[#FDECEC]"
        >
          <Trash2 size={16} color="#E53935" />
        </button>
      </div>
    </div>
  );
}
