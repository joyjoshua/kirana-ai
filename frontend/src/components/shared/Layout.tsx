import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  /** Show the top nav bar */
  showHeader?: boolean;
  /** Show the bottom tab bar */
  showNavBar?: boolean;
  /** Top bar title */
  title?: string;
  /** Optional action element in the top bar (e.g. menu icon) */
  headerAction?: ReactNode;
  /** Extra padding at the bottom to account for the fixed nav bar */
  navBarOffset?: boolean;
}

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/settings', icon: Settings, label: 'Settings' },
] as const;

/**
 * PODS App Shell — top nav bar + bottom tab bar.
 *
 * Top bar: bg #002970, white title + back arrow
 * Bottom bar: active tab uses #002970 icon + label, inactive #9ca3af
 */
function Layout({
  children,
  showHeader = true,
  showNavBar = true,
  title = 'KiranaAI',
  headerAction,
  navBarOffset = true,
}: LayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#f3f4f6]">
      {/* ── Top Navigation Bar ─────────────────────────────────── */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-[#002970] text-white h-14 flex items-center px-4 shrink-0">
          <h1 className="text-[18px] font-medium flex-1">{title}</h1>
          {headerAction && <div>{headerAction}</div>}
        </header>
      )}

      {/* ── Main Content ───────────────────────────────────────── */}
      <main
        className={cn(
          'flex-1 w-full mx-auto',
          // Max width for tablet-like view on desktop
          'max-w-lg',
          // Padding so content is not hidden under bottom bar
          navBarOffset && showNavBar && 'pb-20'
        )}
      >
        {children}
      </main>

      {/* ── Bottom Tab Bar ─────────────────────────────────────── */}
      {showNavBar && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#d0d5dd]"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          aria-label="Main navigation"
        >
          <ul className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to} className="flex-1">
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center justify-center gap-0.5',
                      'w-full h-full py-2',
                      'text-[11px] font-medium transition-colors duration-150',
                      isActive ? 'text-[#002970]' : 'text-[#9ca3af]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className="w-5 h-5"
                        strokeWidth={isActive ? 2.5 : 1.75}
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

/**
 * Section header — overline style (uppercase + letter-spacing)
 */
function SectionHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-[11px] font-medium text-[#9ca3af]',
        'uppercase tracking-[0.08em]',
        'px-4 pt-4 pb-2',
        className
      )}
    >
      {children}
    </p>
  );
}

export { Layout, SectionHeader };
