import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, supabase } from '@/stores/authStore';
import { fetchStoreId } from '@/api/auth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ToastContainer } from '@/components/shared/Toast';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const InventoryPage = lazy(() => import('@/pages/InventoryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

function PageFallback() {
  return (
    <div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: '#F2F2F7' }}>
      <LoadingSpinner size={32} />
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore();

  if (isLoading) return <PageFallback />;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireStore({ children }: { children: React.ReactNode }) {
  const { storeId, isLoading } = useAuthStore();

  if (isLoading) return <PageFallback />;
  if (!storeId) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    const { setSession, setStoreId, setLoading } = useAuthStore.getState();

    // Restore session on app init, then fetch storeId if logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const storeId = await fetchStoreId();
          if (storeId) setStoreId(storeId);
        } catch {
          // no store yet — user will be directed to onboarding
        }
      }
      setLoading(false);
    });

    // Keep session in sync on token refresh / sign-out in another tab
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) useAuthStore.setState({ storeId: null });
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/onboarding"
              element={
                <RequireAuth>
                  <OnboardingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <RequireStore>
                    <HomePage />
                  </RequireStore>
                </RequireAuth>
              }
            />
            <Route
              path="/inventory"
              element={
                <RequireAuth>
                  <RequireStore>
                    <InventoryPage />
                  </RequireStore>
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <RequireStore>
                    <SettingsPage />
                  </RequireStore>
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
