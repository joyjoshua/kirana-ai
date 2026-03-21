import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/shared/Toast';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const navigate = useNavigate();
  const { session, storeId, login, signUp } = useAuthStore();

  useEffect(() => {
    if (session) {
      navigate(storeId ? '/' : '/onboarding', { replace: true });
    }
  }, [session, storeId, navigate]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    if (mode === 'signup' && password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        const { storeId: sid } = useAuthStore.getState();
        navigate(sid ? '/' : '/onboarding', { replace: true });
      } else {
        await signUp(email, password);
        navigate('/onboarding', { replace: true });
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Shared input field styles ──────────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    width: '100%',
    height: '54px',
    borderRadius: '14px',
    fontSize: '17px',
    color: '#1C1C1E',
    letterSpacing: '-0.43px',
    paddingLeft: '50px',
    paddingRight: '48px',
    outline: 'none',
    border: 'none',
    backgroundColor: 'rgba(120,120,128,0.10)',
    transition: 'box-shadow 150ms, background-color 150ms',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  const inputFocused: React.CSSProperties = {
    boxShadow: '0 0 0 2.5px #002970',
    backgroundColor: '#fff',
  };

  const inputError: React.CSSProperties = {
    boxShadow: '0 0 0 2.5px #E53935',
    backgroundColor: 'rgba(229,57,53,0.04)',
  };

  function fieldStyle(name: string, hasError?: string): React.CSSProperties {
    if (hasError) return { ...inputBase, ...inputError };
    if (focusedField === name) return { ...inputBase, ...inputFocused };
    return inputBase;
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        background: 'linear-gradient(160deg, #EEF3FA 0%, #F2F4F8 55%, #E8EFFD 100%)',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            background: 'linear-gradient(140deg, #002970 0%, #1a4fa8 100%)',
            boxShadow: '0 4px 24px rgba(0,41,112,0.28), 0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Mic size={38} color="white" strokeWidth={1.75} />
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.5px', margin: 0 }}>
          KiranaAI
        </h1>
        <p style={{ fontSize: '15px', color: '#8E8E93', letterSpacing: '-0.2px', marginTop: '6px' }}>
          Voice-first sales for your store
        </p>
      </div>

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          borderRadius: '28px',
          padding: '40px 36px',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 40px rgba(0,41,112,0.12), 0 1px 4px rgba(0,0,0,0.06)',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.45px', margin: '0 0 28px', textAlign: 'center' }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: 600, color: '#1C1C1E', letterSpacing: '-0.23px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoComplete="email"
                inputMode="email"
                style={fieldStyle('email', errors.email)}
              />
            </div>
            {errors.email && <p style={{ fontSize: '13px', color: '#E53935', margin: 0 }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '15px', fontWeight: 600, color: '#1C1C1E', letterSpacing: '-0.23px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={fieldStyle('password', errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: '13px', color: '#E53935', margin: 0 }}>{errors.password}</p>}
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', fontWeight: 600, color: '#1C1C1E', letterSpacing: '-0.23px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                  style={fieldStyle('confirm', errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ fontSize: '13px', color: '#E53935', margin: 0 }}>{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '54px',
              borderRadius: '999px',
              backgroundColor: loading ? '#7a9ad1' : '#002970',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 600,
              letterSpacing: '-0.3px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
              transition: 'background-color 150ms, opacity 150ms',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Mode toggle */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <span style={{ fontSize: '14px', color: '#8E8E93' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}
            style={{ fontSize: '14px', fontWeight: 600, color: '#002970', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '40px', fontSize: '12px', color: '#AEAEB2', textAlign: 'center' }}>
        Built for kirana store owners across India
      </p>
    </div>
  );
}
