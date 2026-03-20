import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import OnboardingPage from '@/pages/OnboardingPage';

// Redirect unauthenticated users to /onboarding
function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const storeId = useAuthStore((s) => s.storeId);

  if (!isAuthenticated) return <Navigate to="/onboarding" replace />;
  // Authenticated but store not set up yet — send back to onboarding (step 2)
  if (!storeId) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

// Placeholder until full pages are wired up
function HomePage() {
  const { email, storeId, logout } = useAuthStore();
  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
      <div className="h-14 bg-[#002970] flex items-center px-4 shrink-0">
        <span className="text-white font-semibold text-[17px] tracking-tight">KiranaAI</span>
      </div>
      <div className="flex-1 p-5 space-y-3">
        <p className="text-[17px] font-semibold text-[#1C1C1E]">You're in!</p>
        <p className="text-[15px] text-[#8E8E93]">{email}</p>
        <p className="text-[13px] text-[#C7C7CC]">Store: {storeId}</p>
        <button
          onClick={logout}
          className="mt-4 text-[15px] text-[#e53935]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
