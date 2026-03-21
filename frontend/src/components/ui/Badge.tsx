import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#E6F6F1] text-[#00A86B]',
  warning: 'bg-[#FEF5E7] text-[#B87313]',
  error: 'bg-[#FDECEC] text-[#E53935]',
  info: 'bg-[#E3F0FB] text-[#0071C2]',
  neutral: 'text-[#8E8E93]',
  primary: 'bg-[#EEF3FA] text-[#002970]',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-[10px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.07px]',
        variantStyles[variant],
        className
      )}
      style={variant === 'neutral' ? { backgroundColor: 'rgba(120, 120, 128, 0.12)' } : undefined}
    >
      {children}
    </span>
  );
}
