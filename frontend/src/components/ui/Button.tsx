import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'action' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  // Primary — "Confirm Sale", "Add Item", main CTAs
  primary: [
    'bg-[#002970] text-white',
    'active:bg-[#042e6f]',
    'hover:bg-[#042e6f]',
    'disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed',
  ].join(' '),

  // Action (Cyan) — "Send on WhatsApp", UPI moments ONLY
  action: [
    'bg-[#00baf2] text-white',
    'active:bg-[#0095c7]',
    'hover:bg-[#0095c7]',
    'disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed',
  ].join(' '),

  // Secondary — "View Inventory", supporting actions
  secondary: [
    'bg-[#e8f4fd] text-[#002970]',
    'active:bg-[#d0e8f8]',
    'hover:bg-[#d0e8f8]',
    'disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed',
  ].join(' '),

  // Ghost / Outline — "Cancel", "Skip", "Later"
  ghost: [
    'bg-transparent border-[1.5px] border-[#002970] text-[#002970]',
    'active:bg-[#e8f4fd]',
    'hover:bg-[#e8f4fd]',
    'disabled:border-[#d0d5dd] disabled:text-[#9ca3af] disabled:cursor-not-allowed',
  ].join(' '),

  // Danger — destructive actions
  danger: [
    'bg-[#e53935] text-white',
    'active:bg-[#c62828]',
    'hover:bg-[#c62828]',
    'disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 px-4 text-sm',      // 48px — standard touch target
  sm: 'h-9 px-3 text-xs',       // 36px — compact (e.g. "Reorder" in alert card)
};

/**
 * PODS Button — follows Paytm design system button specs.
 *
 * Rules:
 * - Never more than one `primary` per screen
 * - `action` (cyan) is reserved for UPI/payment moments only
 * - Full-width on mobile by default
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = true,
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-medium rounded-[8px]',
          'transition-colors duration-150',
          'select-none touch-manipulation',
          // Variant
          variantClasses[variant],
          // Size
          sizeClasses[size],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
