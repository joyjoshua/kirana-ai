import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Mic, Package, Settings, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  hideTabBar?: boolean;
}

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/inventory', icon: Package, label: 'Stock' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Layout({ children, title = 'KiranaAI', showBack = false, rightAction, hideTabBar = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-dvh max-w-[480px] mx-auto" style={{ backgroundColor: '#F2F4F8' }}>
      {/* Nav Bar */}
      <header
        className="sticky top-0 z-50 flex items-center gap-3 px-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(60,60,67,0.12)',
          height: '56px',
          paddingTop: 'var(--safe-top)',
        }}
      >
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex items-center justify-center w-11 h-11 -ml-2 rounded-full active:bg-[rgba(0,0,0,0.06)] text-[#002970]"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        )}
        <span className="flex-1 text-[17px] font-semibold text-[#1C1C1E] tracking-[-0.43px] truncate">{title}</span>
        {rightAction && <div className="flex items-center">{rightAction}</div>}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5" style={{ paddingBottom: hideTabBar ? '1.25rem' : '88px' }}>
        {children}
      </main>

      {/* Tab Bar */}
      {!hideTabBar && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 flex"
          style={{
            height: '56px',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '1px solid rgba(60, 60, 67, 0.14)',
            paddingBottom: 'var(--safe-bottom)',
          }}
        >
          {tabs.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center justify-center gap-[3px]"
                style={{ color: isActive ? '#002970' : '#8E8E93' }}
              >
                <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </button>
            );
          })}
          {/* Voice FAB placeholder */}
          <div className="flex-1 flex items-center justify-center">
            <Mic size={24} strokeWidth={1.75} style={{ color: '#8E8E93', opacity: 0.3 }} />
          </div>
        </nav>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4">
      <div className="text-[#C7C7CC]">{icon}</div>
      <h2 className="text-[22px] font-bold text-[#1C1C1E] text-center">{title}</h2>
      {description && (
        <p className="text-[17px] text-[#8E8E93] text-center max-w-[260px]">{description}</p>
      )}
      {action}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-4', className)}>{children}</div>;
}
