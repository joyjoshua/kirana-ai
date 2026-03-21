import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-[6px]">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-[54px] rounded-[14px] text-[17px] text-[#1C1C1E] placeholder-[#AEAEB2] tracking-[-0.43px]',
              'transition-all duration-[150ms]',
              'outline-none',
              leftIcon ? 'pl-[50px] pr-5' : 'px-5',
              error
                ? 'ring-2 ring-[#E53935]'
                : 'focus:ring-2 focus:ring-[#002970] focus:bg-white',
              className
            )}
            style={{ backgroundColor: 'rgba(120, 120, 128, 0.10)' }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[13px] text-[#E53935] tracking-[-0.08px]">{error}</p>
        )}
        {helper && !error && (
          <p className="text-[13px] text-[#8E8E93] tracking-[-0.08px]">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
