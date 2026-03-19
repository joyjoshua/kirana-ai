import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md';
  shadow?: boolean;
}

/**
 * PODS Card — white surface with 12px radius and optional PODS shadow.
 * The base card for amount display, transaction items, etc.
 */
function Card({
  padding = 'md',
  shadow = true,
  className,
  children,
  ...props
}: CardProps) {
  const paddingClass = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
  }[padding];

  return (
    <div
      className={cn(
        'bg-white rounded-[12px] border border-[#d0d5dd]',
        shadow && 'shadow-[0_2px_8px_rgba(0,41,112,0.08)]',
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader — optional top section with title + optional action
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  action?: React.ReactNode;
}

function CardHeader({ title, action, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-4 py-3 border-b border-[#d0d5dd]',
        className
      )}
      {...props}
    >
      <h3 className="text-[16px] font-medium text-[#111827]">{title}</h3>
      {action && <div>{action}</div>}
    </div>
  );
}

export { Card, CardHeader };
