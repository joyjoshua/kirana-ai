import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label: string;
}

/**
 * PODS Filter Chip — used for inventory filters, category tabs.
 *
 * default: bg #e8f4fd, text #002970
 * active:  bg #002970, text #ffffff
 */
function Chip({ active = false, label, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      className={cn(
        'inline-flex items-center justify-center',
        'px-3 py-[5px] rounded-[20px]',
        'text-xs font-medium',
        'transition-colors duration-150',
        'select-none touch-manipulation',
        'min-h-[32px]',             // accessible tap target
        active
          ? 'bg-[#002970] text-white'
          : 'bg-[#e8f4fd] text-[#002970]',
        className
      )}
      {...props}
    >
      {label}
    </button>
  );
}

export { Chip };
