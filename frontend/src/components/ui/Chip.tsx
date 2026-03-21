import { cn } from '@/lib/utils';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, selected = false, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full px-[14px] py-[6px] text-[13px] transition-colors duration-[150ms]',
        selected
          ? 'bg-[#002970] text-white'
          : 'text-[#002970]',
        className
      )}
      style={!selected ? { backgroundColor: 'rgba(0, 41, 112, 0.08)' } : undefined}
    >
      {children}
    </button>
  );
}
