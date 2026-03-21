import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, elevated = false }: CardProps) {
  return (
    <div
      className={cn('rounded-[20px] bg-white p-5', className)}
      style={{
        boxShadow: elevated
          ? '0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn('pb-4 mb-4', className)}
      style={{ borderBottom: '1px solid rgba(198, 198, 200, 0.5)' }}
    >
      {children}
    </div>
  );
}

export function SectionHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.07px] mb-3', className)}>
      {children}
    </p>
  );
}
