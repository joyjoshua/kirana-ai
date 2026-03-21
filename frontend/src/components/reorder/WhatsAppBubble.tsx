import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Check, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { buildWhatsAppLink } from '@/utils/whatsapp';

interface WhatsAppBubbleProps {
  message: string;
  vendorName: string;
  vendorPhone: string;
  itemName: string;
}

export function WhatsAppBubble({ message: initialMessage, vendorName, vendorPhone, itemName }: WhatsAppBubbleProps) {
  const [message, setMessage] = useState(initialMessage);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message);

  const handleSave = () => {
    setMessage(draft);
    setEditing(false);
  };

  const handleSend = () => {
    const link = buildWhatsAppLink(vendorPhone, message);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-[0.07px]">Reorder</p>
          <p className="text-[15px] font-semibold text-[#1C1C1E] tracking-[-0.23px]">{itemName}</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(!editing); setDraft(message); }}
          aria-label="Edit message"
          className="flex items-center justify-center w-9 h-9 rounded-full active:bg-[#EEF3FA]"
        >
          {editing ? <Check size={18} color="#002970" /> : <Pencil size={16} color="#002970" />}
        </button>
      </div>

      {/* WhatsApp bubble */}
      <div
        className="px-4 py-3"
        style={{
          backgroundColor: '#DCF8C6',
          borderRadius: '0 16px 16px 16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <p className="text-[13px] font-semibold text-[#1C1C1E] tracking-[-0.08px] mb-1">{vendorName}</p>
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-[8px] p-2 text-[15px] text-[#1C1C1E] outline-none ring-2 ring-[#002970] resize-none"
              style={{ backgroundColor: 'rgba(120, 120, 128, 0.08)', minHeight: 80 }}
              autoFocus
            />
            <button
              type="button"
              onClick={handleSave}
              className="self-end text-[13px] font-semibold text-[#002970] px-3 py-1 rounded-[8px] active:bg-[#EEF3FA]"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="text-[15px] text-[#1C1C1E] tracking-[-0.23px] whitespace-pre-wrap">{message}</p>
        )}
        <p className="text-right text-[12px] text-[#8E8E93] mt-1">
          {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <Button variant="secondary" className="w-full" onClick={handleSend}>
        <Send size={16} className="mr-2" />
        Send on WhatsApp to {vendorName}
      </Button>
    </motion.div>
  );
}
