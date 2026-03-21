import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantColors: Record<BadgeVariant, { color: string; backgroundColor?: string }> = {
  success: { color: '#00A87A', backgroundColor: '#E6FAF5' },
  warning: { color: '#B87313', backgroundColor: '#FEF5E7' },
  error:   { color: '#E53935', backgroundColor: '#FDECEC' },
  info:    { color: '#0071C2', backgroundColor: '#E3F0FB' },
  neutral: { color: '#8E8E93', backgroundColor: 'rgba(120, 120, 128, 0.12)' },
  primary: { color: '#002970', backgroundColor: '#EEF3FA' },
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  const { color, backgroundColor } = variantColors[variant];
  return (
    <span
      className={cn('inline-flex items-center rounded-full text-[12px] font-semibold uppercase tracking-[0.3px]', className)}
      style={{ color, backgroundColor, padding: '7px 16px' }}
    >
      {children}
    </span>
  );
}
