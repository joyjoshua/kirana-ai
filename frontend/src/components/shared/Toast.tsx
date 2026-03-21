import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-up rounded-[14px] px-5 py-[14px] text-[15px] text-white max-w-[calc(100vw-32px)] pointer-events-auto"
          style={{
            backgroundColor: toast.type === 'error' ? '#E53935' : toast.type === 'success' ? '#00A86B' : '#1C1C1E',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.14)',
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
