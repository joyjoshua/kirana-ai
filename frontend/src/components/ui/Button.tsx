import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'upi';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-[80ms] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const sizes = {
      md: 'h-[50px] rounded-[14px] px-6 text-[17px] tracking-[-0.43px]',
      sm: 'h-9 rounded-[10px] px-4 text-[15px] tracking-[-0.23px]',
    };

    const variants = {
      primary: 'bg-[#002970] text-white active:bg-[#001d52] focus-visible:outline-[#002970]',
      secondary: 'bg-[#EEF3FA] text-[#002970] active:bg-[#dde9f7] focus-visible:outline-[#002970]',
      ghost: 'bg-transparent text-[#002970] active:bg-[#EEF3FA] focus-visible:outline-[#002970]',
      destructive: 'bg-[#FDECEC] text-[#E53935] active:bg-[#fbd9d9] focus-visible:outline-[#E53935]',
      upi: 'bg-[#00BAF2] text-white active:bg-[#009fd4] focus-visible:outline-[#00BAF2]',
    };

    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin-arc" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
