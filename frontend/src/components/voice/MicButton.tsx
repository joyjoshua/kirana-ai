import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Check, X, Loader2 } from 'lucide-react';
import type { VoiceState } from '@/hooks/useVoiceState';

interface MicButtonProps {
  state: VoiceState;
  onPress: () => void;
  disabled?: boolean;
}

const stateConfig: Record<VoiceState, {
  bg: string;
  icon: React.ReactNode;
  label: string;
  showPulse: boolean;
  showSpinner: boolean;
}> = {
  idle: {
    bg: '#002970',
    icon: <Mic size={28} color="white" />,
    label: 'Start recording sale',
    showPulse: true,
    showSpinner: false,
  },
  listening: {
    bg: '#002970',
    icon: <Square size={24} color="white" fill="white" />,
    label: 'Stop recording',
    showPulse: false,
    showSpinner: false,
  },
  processing: {
    bg: '#003A9E',
    icon: <Loader2 size={28} color="white" className="animate-spin-arc" />,
    label: 'Processing…',
    showPulse: false,
    showSpinner: true,
  },
  confirmation: {
    bg: '#002970',
    icon: <Mic size={28} color="white" />,
    label: 'Re-record sale',
    showPulse: false,
    showSpinner: false,
  },
  committed: {
    bg: '#00A86B',
    icon: <Check size={28} color="white" strokeWidth={2.5} />,
    label: 'Sale recorded',
    showPulse: false,
    showSpinner: false,
  },
  error: {
    bg: '#E53935',
    icon: <X size={28} color="white" strokeWidth={2.5} />,
    label: 'Retry recording',
    showPulse: false,
    showSpinner: false,
  },
};

export function MicButton({ state, onPress, disabled = false }: MicButtonProps) {
  const config = stateConfig[state];
  const isDisabled = disabled || state === 'processing' || state === 'committed';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      {/* Pulse rings for idle */}
      <AnimatePresence>
        {config.showPulse && (
          <>
            <motion.div
              key="ring-1"
              className="absolute rounded-full border-4 border-[#002970]/25"
              initial={{ width: 72, height: 72, opacity: 0.6 }}
              animate={{ width: 108, height: 108, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.3 }}
            />
            <motion.div
              key="ring-2"
              className="absolute rounded-full border-4 border-[#002970]/15"
              initial={{ width: 72, height: 72, opacity: 0.4 }}
              animate={{ width: 128, height: 128, opacity: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.3, delay: 0.3 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Active listening ring */}
      {state === 'listening' && (
        <motion.div
          className="absolute rounded-full"
          style={{ border: '3px solid rgba(0, 41, 112, 0.4)' }}
          animate={{ width: [72, 96, 72], height: [72, 96, 72], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
        />
      )}

      {/* Main button */}
      <motion.button
        type="button"
        onClick={onPress}
        disabled={isDisabled}
        aria-label={config.label}
        whileTap={!isDisabled ? { scale: 0.92 } : undefined}
        animate={{ backgroundColor: config.bg, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 flex items-center justify-center rounded-full disabled:opacity-50"
        style={{
          width: 72,
          height: 72,
          boxShadow: '0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10)',
          cursor: isDisabled ? 'default' : 'pointer',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            {config.icon}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
