import { LogOut, ChevronRight, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout, PageContainer } from '@/components/shared/Layout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { showToast } from '@/components/shared/Toast';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingRow({ icon, label, value, onPress }: SettingRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className="flex items-center gap-3 w-full py-3 text-left active:bg-[#F2F2F7] transition-colors"
    >
      <span className="text-[#002970]">{icon}</span>
      <span className="flex-1 text-[17px] text-[#1C1C1E] tracking-[-0.43px]">{label}</span>
      {value && <span className="text-[15px] text-[#8E8E93] tracking-[-0.23px]">{value}</span>}
      {onPress && <ChevronRight size={18} color="#C7C7CC" />}
    </button>
  );
}

export default function SettingsPage() {
  const { storeId, session, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      showToast('Could not log out', 'error');
    }
  };

  return (
    <Layout title="Settings">
      <PageContainer>
        <Card>
          <div style={{ borderBottom: '1px solid rgba(198,198,200,0.5)' }}>
            <SettingRow icon={<Store size={20} />} label="Store ID" value={storeId ? `${storeId.slice(0, 8)}…` : 'Not set'} />
          </div>
          <SettingRow icon={<LogOut size={20} />} label="Email" value={session?.user?.email ?? '—'} />
        </Card>

        <Card>
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.07px] mb-3">Account</p>
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            Log Out
          </Button>
        </Card>

        <p className="text-center text-[13px] text-[#C7C7CC]">KiranaAI v1.0.0 — Hackathon Edition</p>
      </PageContainer>
    </Layout>
  );
}
