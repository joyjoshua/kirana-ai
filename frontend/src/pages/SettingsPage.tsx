import { useEffect, useState } from 'react';
import {
  Store, LogOut, Phone, CreditCard, User, ChevronRight,
  Pencil, Check, X, Copy,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout, PageContainer } from '@/components/shared/Layout';
import { useAuthStore } from '@/stores/authStore';
import { fetchStoreDetails, updateStoreDetails, type StoreDetails } from '@/api/auth';
import { showToast } from '@/components/shared/Toast';

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8, paddingLeft: 4 }}>
      {children}
    </p>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[20px] bg-white overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: '0.5px', backgroundColor: 'rgba(198,198,200,0.6)', marginLeft: 52 }} />;
}

function ReadRow({
  icon,
  label,
  value,
  onPress,
  destructive = false,
  copyable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    if (value) {
      void navigator.clipboard.writeText(value);
      showToast('Copied!', 'success');
    }
  };

  return (
    <div className="flex items-center gap-3" style={{ padding: '14px 20px' }}>
      <span style={{ color: destructive ? '#E53935' : '#002970', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 16, color: destructive ? '#E53935' : '#1C1C1E', letterSpacing: '-0.3px' }}>
        {label}
      </span>
      {value && (
        <span style={{ fontSize: 14, color: '#8E8E93', letterSpacing: '-0.2px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      )}
      {copyable && value && (
        <button type="button" onClick={handleCopy} style={{ color: '#8E8E93', flexShrink: 0, marginLeft: 4 }}>
          <Copy size={14} />
        </button>
      )}
      {onPress && (
        <button type="button" onClick={onPress} style={{ flexShrink: 0, marginLeft: copyable ? 0 : 4 }}>
          <ChevronRight size={16} color="#C7C7CC" />
        </button>
      )}
    </div>
  );
}

function EditableField({
  icon,
  label,
  value,
  inputType = 'text',
  inputMode,
  placeholder,
  onSave,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  inputType?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
  onSave: (val: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  const handleSave = async () => {
    if (draft.trim() === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ padding: '12px 20px', backgroundColor: 'rgba(0,41,112,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ color: '#002970', flexShrink: 0 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type={inputType}
            inputMode={inputMode}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="flex-1 outline-none"
            style={{
              height: 40, borderRadius: 10, padding: '0 16px 0 20px',
              fontSize: 15, color: '#1C1C1E',
              backgroundColor: 'rgba(120,120,128,0.10)',
              border: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: '#002970', opacity: saving ? 0.7 : 1 }}
          >
            <Check size={16} color="white" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 36, height: 36, backgroundColor: 'rgba(120,120,128,0.12)' }}
          >
            <X size={16} color="#8E8E93" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3" style={{ padding: '14px 20px' }}>
      <span style={{ color: '#002970', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 15, color: value ? '#1C1C1E' : '#AEAEB2', letterSpacing: '-0.23px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || (placeholder ?? 'Not set')}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{ width: 32, height: 32, backgroundColor: 'rgba(0,41,112,0.08)' }}
      >
        <Pencil size={13} color="#002970" strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { storeId, session, logout } = useAuthStore();
  const navigate = useNavigate();
  const [details, setDetails] = useState<StoreDetails | null>(null);

  const email = session?.user?.email ?? '';
  const displayName = details?.owner_name ?? email.split('@')[0] ?? 'User';
  const initials = (details?.owner_name ?? email).charAt(0).toUpperCase() || '?';

  useEffect(() => {
    void fetchStoreDetails().then(setDetails).catch(() => null);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      showToast('Could not log out', 'error');
    }
  };

  const save = async (field: keyof Omit<StoreDetails, 'id'>, value: string) => {
    try {
      await updateStoreDetails({ [field]: value });
      setDetails((prev) => prev ? { ...prev, [field]: value } : prev);
      showToast('Saved', 'success');
    } catch {
      showToast('Could not save. Try again.', 'error');
      throw new Error('save failed');
    }
  };

  return (
    <Layout title="Settings">
      <PageContainer className="pt-2">

        {/* ── Profile ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 80, height: 80,
              background: 'linear-gradient(140deg, #002970 0%, #1a4fa8 100%)',
              boxShadow: '0 4px 20px rgba(0,41,112,0.28)',
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1 }}>{initials}</span>
          </div>
          <div className="text-center">
            <p style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.4px', textTransform: 'capitalize' }}>
              {displayName}
            </p>
            <p style={{ fontSize: 14, color: '#8E8E93', marginTop: 2 }}>{email}</p>
          </div>
        </div>

        {/* ── Store Details ────────────────────────────────────────── */}
        <div>
          <SectionLabel>Store</SectionLabel>
          <InfoCard>
            <EditableField
              icon={<Store size={18} />}
              label="Store Name"
              value={details?.store_name ?? ''}
              placeholder="Your store name"
              onSave={(v) => save('store_name', v)}
            />
            <Divider />
            <EditableField
              icon={<User size={18} />}
              label="Owner Name"
              value={details?.owner_name ?? ''}
              placeholder="Your name"
              onSave={(v) => save('owner_name', v)}
            />
          </InfoCard>
        </div>

        {/* ── Contact & Payment ────────────────────────────────────── */}
        <div>
          <SectionLabel>Contact &amp; Payment</SectionLabel>
          <InfoCard>
            <EditableField
              icon={<Phone size={18} />}
              label="Mobile Number"
              value={details?.phone ?? ''}
              inputType="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              onSave={(v) => save('phone', v)}
            />
            <Divider />
            <EditableField
              icon={<CreditCard size={18} />}
              label="UPI ID"
              value={details?.upi_vpa ?? ''}
              placeholder="yourstore@upi"
              onSave={(v) => save('upi_vpa', v)}
            />
          </InfoCard>
        </div>

        {/* ── Info (read-only) ─────────────────────────────────────── */}
        <div>
          <SectionLabel>Info</SectionLabel>
          <InfoCard>
            <ReadRow
              icon={<Store size={18} />}
              label="Store ID"
              value={storeId ? `${storeId.slice(0, 8)}…` : 'Not set'}
              copyable
            />
          </InfoCard>
        </div>

        {/* ── Account ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Account</SectionLabel>
          <InfoCard>
            <ReadRow
              icon={<LogOut size={18} />}
              label="Log Out"
              onPress={handleLogout}
              destructive
            />
          </InfoCard>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p style={{ textAlign: 'center', fontSize: 12, color: '#C7C7CC', letterSpacing: '-0.1px', paddingTop: 8, paddingBottom: 16 }}>
          KiranaAI v1.0.0 — Hackathon Edition
        </p>

      </PageContainer>
    </Layout>
  );
}
