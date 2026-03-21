import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { session, storeId } = useAuthStore();

  useEffect(() => {
    if (session) {
      navigate(storeId ? '/' : '/onboarding', { replace: true });
    }
  }, [session, storeId, navigate]);

  const handleSuccess = () => {
    const { storeId: sid, session: s } = useAuthStore.getState();
    if (!s) return;
    if (mode === 'signup' || !sid) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <div
      className="min-h-dvh w-full flex flex-col items-center justify-center px-6 py-16"
      style={{
        background: 'linear-gradient(160deg, #EEF3FA 0%, #F2F4F8 55%, #E8EFFD 100%)',
      }}
    >
      {/* Brand */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div
          className="w-[88px] h-[88px] rounded-[24px] flex items-center justify-center mb-5"
          style={{
            backgroundColor: '#002970',
            boxShadow: '0 4px 24px rgba(0,41,112,0.22), 0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Mic size={40} color="white" strokeWidth={1.75} />
        </div>
        <h1
          className="text-[30px] font-bold text-[#1C1C1E] tracking-[-0.5px]"
        >
          KiranaAI
        </h1>
        <p className="text-[15px] text-[#8E8E93] tracking-[-0.23px] mt-1">
          Voice-first sales for your store
        </p>
      </div>

      {/* Form area — no card, floats on gradient */}
      <div className="w-full max-w-[380px]">
        <h2
          className="text-[24px] font-bold text-[#1C1C1E] tracking-[-0.4px] mb-7 text-center"
        >
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>

        <AuthForm mode={mode} onSuccess={handleSuccess} />

        <div className="mt-6 text-center">
          <span className="text-[15px] text-[#8E8E93] tracking-[-0.23px]">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[15px] font-semibold text-[#002970] tracking-[-0.23px]"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-14 text-[12px] text-[#AEAEB2] text-center">
        Built for kirana store owners across India
      </p>
    </div>
  );
}
