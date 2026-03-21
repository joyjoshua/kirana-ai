import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Package, Settings, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  hideTabBar?: boolean;
}

const CONTENT_MAX_WIDTH = 520;

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/inventory', icon: Package, label: 'Stock' },
  { path: '/sales', icon: ShoppingBag, label: 'Sales' },
  { path: '/settings', icon: Settings, label: 'Settings' },
] as const;

export function Layout({ children, title = 'KiranaAI', showBack = false, rightAction, hideTabBar = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-dvh w-full" style={{ backgroundColor: '#F2F2F7' }}>

      {/* ── Full-width header bar ─────────────────────────────────────────────── */}
      {/* The `header` spans the full viewport. Inner content is centered. */}
      <header
        className="sticky top-0 z-50 w-full flex justify-center"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(60,60,67,0.10)',
          paddingTop: 'var(--safe-top)',
        }}
      >
        <div
          className="w-full flex items-center gap-2 px-4"
          style={{ maxWidth: CONTENT_MAX_WIDTH, height: '56px' }}
        >
          {showBack && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-[rgba(0,0,0,0.06)] text-[#002970]"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          )}
          <span className="flex-1 min-w-0 text-[17px] font-semibold text-[#1C1C1E] tracking-[-0.43px] truncate">
            {title}
          </span>
          {rightAction && <div className="flex items-center gap-2 flex-shrink-0">{rightAction}</div>}
        </div>
      </header>

      {/* ── Scrollable content area ───────────────────────────────────────────── */}
      {/* `main` fills available height and is scrollable.                        */}
      {/* Inner wrapper centers the content column in the viewport.               */}
      <main
        className="flex-1 overflow-y-auto flex flex-col items-center w-full"
        style={{ paddingBottom: hideTabBar ? '1.25rem' : '88px' }}
      >
        <div
          className="w-full flex flex-col justify-center"
          style={{ maxWidth: CONTENT_MAX_WIDTH, minHeight: '100%', padding: '28px 16px 20px' }}
        >
          {children}
        </div>
      </main>

      {/* ── Full-width tab bar ────────────────────────────────────────────────── */}
      {!hideTabBar && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center"
          style={{
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: '1px solid rgba(60,60,67,0.10)',
            paddingBottom: 'var(--safe-bottom)',
          }}
        >
          <div
            className="w-full flex"
            style={{ maxWidth: CONTENT_MAX_WIDTH, height: '56px' }}
          >
            {tabs.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => navigate(path)}
                  className="flex-1 flex flex-col items-center justify-center gap-[3px]"
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    color={isActive ? '#002970' : '#8E8E93'}
                  />
                  <span
                    className="text-[10px] font-semibold leading-none"
                    style={{ color: isActive ? '#002970' : '#8E8E93' }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
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
      <h2 className="text-[22px] font-bold text-[#1C1C1E] text-center tracking-[-0.4px]">{title}</h2>
      {description && (
        <p className="text-[15px] text-[#8E8E93] text-center max-w-[260px] leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-4', className)}>{children}</div>;
}
