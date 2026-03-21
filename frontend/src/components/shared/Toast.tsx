import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

type ToastListener = (msg: ToastMessage) => void;
const listeners: ToastListener[] = [];

export function showToast(message: string, type: ToastMessage['type'] = 'info') {
  const id = Math.random().toString(36).slice(2);
  const msg: ToastMessage = { id, message, type };
  listeners.forEach((l) => l(msg));
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    backgroundColor: '#1A3A2A',
    iconColor: '#34D399',
    borderColor: 'rgba(52,211,153,0.25)',
  },
  error: {
    icon: XCircle,
    backgroundColor: '#3A1A1A',
    iconColor: '#F87171',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  info: {
    icon: Info,
    backgroundColor: '#1C1C1E',
    iconColor: '#60A5FA',
    borderColor: 'rgba(96,165,250,0.2)',
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: ToastListener = (msg) => {
      setToasts((prev) => [...prev, msg]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }, 3000);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-[80px] left-0 right-0 flex flex-col items-center gap-2 px-4 z-[9999] pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const config = toastConfig[toast.type];
        const Icon = config.icon;
        return (
          <div
            key={toast.id}
            className="animate-slide-up rounded-[14px] pointer-events-auto flex items-center gap-3 max-w-[calc(100vw-32px)]"
            style={{
              backgroundColor: config.backgroundColor,
              border: `1px solid ${config.borderColor}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 20px 48px rgba(0,0,0,0.18)',
              padding: '14px 18px',
            }}
          >
            <Icon size={18} color={config.iconColor} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span className="text-[14px] font-medium text-white leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
