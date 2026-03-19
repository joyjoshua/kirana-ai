import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  prefix?: string;          // e.g. "₹" for amount fields
  suffix?: string;          // e.g. "kg" for qty fields
  state?: 'default' | 'error' | 'success';
}

/**
 * PODS Input Field — Paytm design system text input.
 *
 * States: default → focus (cyan border) → error (red) → success (green)
 * Prefix/suffix support for ₹ amounts and unit labels.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      successText,
      prefix,
      suffix,
      state = 'default',
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const hasError = state === 'error' || !!errorText;
    const hasSuccess = state === 'success' || !!successText;

    const borderClass = hasError
      ? 'border-[#e53935] focus:border-[#e53935]'
      : hasSuccess
        ? 'border-[#00a86b] focus:border-[#00a86b]'
        : 'border-[#d0d5dd] focus:border-[#00baf2]';

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[#111827]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-sm text-[#4b5563] select-none pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              // Base
              'w-full rounded-[8px] border-[1.5px] bg-white',
              'text-sm text-[#111827] placeholder-[#9ca3af]',
              'py-2.5 outline-none transition-colors duration-150',
              // Padding accounts for prefix/suffix
              prefix ? 'pl-8 pr-3' : 'px-3',
              suffix ? 'pr-8' : '',
              // Border state
              borderClass,
              // Disabled
              disabled && 'bg-[#f3f4f6] border-[#e5e7eb] text-[#9ca3af] cursor-not-allowed',
              className
            )}
            {...props}
          />

          {suffix && (
            <span className="absolute right-3 text-sm text-[#4b5563] select-none pointer-events-none">
              {suffix}
            </span>
          )}

          {hasSuccess && !suffix && (
            <span className="absolute right-3 text-[#00a86b]" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8l3.5 3.5L13 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>

        {/* Helper / error / success text */}
        {errorText && (
          <p className="text-xs text-[#e53935]" role="alert">
            {errorText}
          </p>
        )}
        {successText && !errorText && (
          <p className="text-xs text-[#00a86b]">{successText}</p>
        )}
        {helperText && !errorText && !successText && (
          <p className="text-xs text-[#9ca3af]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
