import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'upi' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-[#00a86b] text-white',   // "PAID"
  error:   'bg-[#e53935] text-white',   // "FAILED"
  warning: 'bg-[#f5a623] text-white',   // "PENDING"
  upi:     'bg-[#00baf2] text-white',   // "UPI"
  info:    'bg-[#1565c0] text-white',   // informational
  neutral: 'bg-[#f3f4f6] text-[#4b5563]',
};

/**
 * PODS Status Badge — used for payment status, transaction labels.
 *
 * Rules:
 * - Always paired with an icon/text label — never color alone
 * - Text is uppercase (overline style)
 */
function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'px-2 py-0.5 rounded-[12px]',
        'text-[11px] font-medium tracking-[0.04em] uppercase',
        'whitespace-nowrap select-none',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
