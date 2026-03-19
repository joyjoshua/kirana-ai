import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { MicButton, type VoiceState } from '@/components/voice/MicButton';
import { Layout, SectionHeader } from '@/components/shared/Layout';
import { formatINR } from '@/utils/formatCurrency';
import { AlertTriangle } from 'lucide-react';

// ─── Design System Showcase (dev-only reference) ──────────────────────────
function DesignSystemPage() {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [activeChip, setActiveChip] = useState<string>('All');
  const chips = ['All', 'Grains', 'Dairy', 'Beverages', 'Snacks'];

  const cycleVoiceState = () => {
    const order: VoiceState[] = ['idle', 'listening', 'processing', 'confirmation', 'committed', 'error', 'idle'];
    const current = order.indexOf(voiceState);
    setVoiceState(order[(current + 1) % order.length]);
  };

  return (
    <Layout title="Design System" showNavBar>
      <div className="p-4 space-y-6">

        {/* ── Colors ──────────────────────────────────────────── */}
        <SectionHeader>Brand Colors</SectionHeader>
        <div className="grid grid-cols-4 gap-2">
          {[
            { hex: '#002970', label: 'Primary' },
            { hex: '#00baf2', label: 'Cyan' },
            { hex: '#e8f4fd', label: 'Light' },
            { hex: '#042e6f', label: 'Deep' },
          ].map(({ hex, label }) => (
            <div key={hex} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 rounded-[8px] border border-[#d0d5dd]"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[10px] text-[#4b5563] text-center">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { hex: '#00a86b', label: 'Success' },
            { hex: '#e53935', label: 'Error' },
            { hex: '#f5a623', label: 'Warning' },
            { hex: '#f3f4f6', label: 'Surface' },
          ].map(({ hex, label }) => (
            <div key={hex} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 rounded-[8px] border border-[#d0d5dd]"
                style={{ backgroundColor: hex }}
              />
              <span className="text-[10px] text-[#4b5563] text-center">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Typography ──────────────────────────────────────── */}
        <SectionHeader>Typography</SectionHeader>
        <Card>
          <div className="space-y-3">
            <p className="text-display">₹1,085.00</p>
            <p className="text-h1">Record Sale</p>
            <p className="text-h2">Section Header</p>
            <p className="text-h3">Item Group Label</p>
            <p className="text-body">Atta 1kg, Parle-G x2 — body text at 14px</p>
            <p className="text-caption">TXN #a1b2c3 · 2 min ago</p>
            <p className="text-overline">Reorder Draft</p>
          </div>
        </Card>

        {/* ── Buttons ─────────────────────────────────────────── */}
        <SectionHeader>Buttons</SectionHeader>
        <div className="space-y-2">
          <Button variant="primary">Confirm Sale</Button>
          <Button variant="action">Send on WhatsApp</Button>
          <Button variant="secondary">View Inventory</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete Item</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading>
            Processing...
          </Button>
          <div className="flex gap-2">
            <Button variant="primary" fullWidth={false} size="sm">
              Small
            </Button>
            <Button variant="secondary" fullWidth={false} size="sm">
              Small 2
            </Button>
          </div>
        </div>

        {/* ── Inputs ──────────────────────────────────────────── */}
        <SectionHeader>Inputs</SectionHeader>
        <div className="space-y-3">
          <Input label="Store Name" placeholder="e.g. Ramesh General Store" />
          <Input
            label="Amount"
            prefix="₹"
            placeholder="0.00"
            type="number"
            inputMode="decimal"
          />
          <Input
            label="Quantity"
            suffix="kg"
            placeholder="0"
            type="number"
            inputMode="decimal"
          />
          <Input
            label="Phone Number"
            state="error"
            errorText="Invalid phone number"
            placeholder="+91 98765 43210"
          />
          <Input
            label="UPI VPA"
            state="success"
            successText="VPA verified"
            placeholder="ramesh@upi"
          />
          <Input label="Disabled Field" disabled value="Read only" />
        </div>

        {/* ── Badges ──────────────────────────────────────────── */}
        <SectionHeader>Badges</SectionHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Paid</Badge>
          <Badge variant="error">Failed</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="upi">UPI</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="neutral">Cash</Badge>
        </div>

        {/* ── Chips ───────────────────────────────────────────── */}
        <SectionHeader>Filter Chips</SectionHeader>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              active={activeChip === chip}
              onClick={() => setActiveChip(chip)}
            />
          ))}
        </div>

        {/* ── Cards ───────────────────────────────────────────── */}
        <SectionHeader>Cards</SectionHeader>

        {/* Sale confirmation card */}
        <Card padding="none">
          {[
            { name: 'Atta 1kg', qty: '1 kg', price: 45 },
            { name: 'Parle-G Biscuit', qty: '2 pcs', price: 20 },
            { name: 'Maggi Noodles', qty: '3 pcs', price: 42 },
          ].map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-4 py-3 border-b border-[#d0d5dd] last:border-b-0"
            >
              <span className="text-sm text-[#111827]">{item.name}</span>
              <span className="text-sm font-medium text-[#002970]">
                {item.qty} · {formatINR(item.price)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center px-4 py-3 bg-[#e8f4fd]">
            <span className="text-base font-bold text-[#111827]">Total</span>
            <span className="text-base font-bold text-[#002970]">{formatINR(107)}</span>
          </div>
        </Card>

        {/* Low stock alert */}
        <div className="bg-[#fffbf0] border-l-4 border-[#f5a623] rounded-r-[8px] p-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#f5a623] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#111827]">Atta 1kg — Low Stock</p>
            <p className="text-[13px] text-[#e53935] mt-0.5">Only 2kg remaining</p>
          </div>
          <button className="h-9 px-3 bg-[#002970] text-white text-xs font-medium rounded-[8px] shrink-0 touch-manipulation">
            Reorder
          </button>
        </div>

        {/* WhatsApp bubble preview */}
        <div className="bg-[#e8f4fd] rounded-[12px] p-4">
          <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-[0.08em] mb-3">
            Reorder Draft
          </p>
          <div className="bg-[#dcf8c6] rounded-[8px] px-3 py-2.5 max-w-[85%]">
            <p className="text-sm text-[#111827]">
              Namaste Suresh Bhai! Atta ka stock kam ho gaya. Please 10 packets bhej do.
            </p>
          </div>
          <div className="space-y-2 mt-3">
            <Button variant="action">Send on WhatsApp</Button>
            <Button variant="secondary">Edit Message</Button>
          </div>
        </div>

        {/* ── Mic Button ──────────────────────────────────────── */}
        <SectionHeader>Mic Button (tap to cycle states)</SectionHeader>
        <div className="flex justify-center py-4">
          <MicButton state={voiceState} onPress={cycleVoiceState} />
        </div>
        <p className="text-center text-sm text-[#4b5563]">
          Current state: <strong>{voiceState}</strong>
        </p>
        <p className="text-center text-xs text-[#9ca3af] pb-2">
          Tap to cycle: idle → listening → processing → confirmation → committed → error
        </p>
      </div>
    </Layout>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Design system showcase — will be replaced with real pages */}
        <Route path="/*" element={<DesignSystemPage />} />
      </Routes>
    </BrowserRouter>
  );
}
