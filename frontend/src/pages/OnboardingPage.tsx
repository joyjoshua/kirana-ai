import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';

type Mode = 'login' | 'register';
type Step = 'auth' | 'store';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { login, register, createStore } = useAuthStore();

  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('auth');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth step
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Store setup step
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiVpa, setUpiVpa] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { storeId } = await login(email, password);
        if (storeId) {
          navigate('/');
        } else {
          setStep('store');
        }
      } else {
        await register(email, password);
        setStep('store');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createStore({ owner_name: ownerName, store_name: storeName, phone, upi_vpa: upiVpa });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  // ── Store setup step ──────────────────────────────────────────────────────

  if (step === 'store') {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
        <div className="h-14 bg-[#002970] flex items-center px-4 shrink-0">
          <span className="text-white font-semibold text-[17px] tracking-tight">KiranaAI</span>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <h1 className="text-[28px] font-bold text-[#1C1C1E] mb-1 tracking-tight">Set up your store</h1>
          <p className="text-[15px] text-[#8E8E93] mb-6">This helps us personalise your experience</p>

          <form onSubmit={handleCreateStore} className="space-y-4">
            <Input
              label="Your Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              autoComplete="name"
              required
            />
            <Input
              label="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Ramesh General Store"
              required
            />
            <Input
              label="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              type="tel"
              autoComplete="tel"
              required
            />
            <Input
              label="UPI VPA"
              value={upiVpa}
              onChange={(e) => setUpiVpa(e.target.value)}
              placeholder="ramesh@upi"
              required
            />

            {error && <p className="text-[13px] text-[#e53935]">{error}</p>}

            <div className="pt-2">
              <Button type="submit" variant="primary" loading={loading}>
                Start Using KiranaAI
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Auth step ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col">
      <div className="h-14 bg-[#002970] flex items-center px-4 shrink-0">
        <span className="text-white font-semibold text-[17px] tracking-tight">KiranaAI</span>
      </div>

      <div className="flex-1 p-5">
        <h1 className="text-[28px] font-bold text-[#1C1C1E] mb-1 tracking-tight">
          {mode === 'login' ? 'Welcome back' : 'Get started'}
        </h1>
        <p className="text-[15px] text-[#8E8E93] mb-6">
          {mode === 'login' ? 'Sign in to your store' : 'Create your KiranaAI account'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />

          {error && <p className="text-[13px] text-[#e53935]">{error}</p>}

          <div className="pt-2">
            <Button type="submit" variant="primary" loading={loading}>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </div>
        </form>

        <button
          type="button"
          className="mt-5 w-full text-center text-[15px] text-[#002970] py-2"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
