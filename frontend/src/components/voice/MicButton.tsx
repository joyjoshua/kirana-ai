import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'confirmation' | 'error' | 'committed' | 'disabled';

interface MicButtonProps {
  state: VoiceState;
  onPress: () => void;
  className?: string;
}

const stateConfig = {
  idle: {
    bg: '#002970',
    iconColor: '#ffffff',
    label: 'Bol Ramesh Bhai...',
    ariaLabel: 'Start voice recording',
  },
  listening: {
    bg: '#e53935',
    iconColor: '#ffffff',
    label: 'Sun raha hoon...',
    ariaLabel: 'Stop recording',
  },
  processing: {
    bg: '#002970',
    iconColor: '#ffffff',
    label: 'Samajh raha hoon...',
    ariaLabel: 'Processing your voice',
  },
  confirmation: {
    bg: '#002970',
    iconColor: '#ffffff',
    label: 'Confirm karo',
    ariaLabel: 'Confirm sale items',
  },
  error: {
    bg: '#f5a623',
    iconColor: '#ffffff',
    label: 'Phir se bolo',
    ariaLabel: 'Retry voice recording',
  },
  committed: {
    bg: '#00a86b',
    iconColor: '#ffffff',
    label: 'Sale recorded!',
    ariaLabel: 'Sale committed',
  },
  disabled: {
    bg: '#f3f4f6',
    iconColor: '#9ca3af',
    label: '',
    ariaLabel: 'Voice unavailable',
  },
} as const;

/**
 * PODS Mic Button — the primary voice interaction trigger.
 *
 * States:
 * - idle       → Pulsing blue circle, "Bol Ramesh Bhai..."
 * - listening  → Red circle (stop recording), waveform ring
 * - processing → Blue circle with spinner
 * - error      → Orange circle, "Phir se bolo"
 * - committed  → Green circle, "Sale recorded!"
 * - disabled   → Grey circle, no interaction
 *
 * Touch target: 64×64px (accessible for rough hands)
 * Fixed bottom-center on mobile layout.
 */
function MicButton({ state, onPress, className }: MicButtonProps) {
  const config = stateConfig[state];
  const isInteractive = state !== 'disabled' && state !== 'processing' && state !== 'committed';

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <motion.button
        type="button"
        onClick={isInteractive ? onPress : undefined}
        disabled={!isInteractive}
        aria-label={config.ariaLabel}
        aria-live="polite"
        style={{ backgroundColor: config.bg }}
        className={cn(
          'w-16 h-16 rounded-full',
          'flex items-center justify-center',
          'touch-manipulation select-none',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00baf2] focus-visible:ring-offset-2',
          isInteractive ? 'cursor-pointer' : 'cursor-not-allowed'
        )}
        // Idle pulse animation
        animate={
          state === 'idle'
            ? {
                scale: [1, 1.08, 1],
                boxShadow: [
                  '0 0 0 0px rgba(0,41,112,0.3)',
                  '0 0 0 10px rgba(0,41,112,0)',
                  '0 0 0 0px rgba(0,41,112,0)',
                ],
              }
            : state === 'listening'
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 0 0px rgba(229,57,53,0.3)',
                    '0 0 0 12px rgba(229,57,53,0)',
                    '0 0 0 0px rgba(229,57,53,0)',
                  ],
                }
              : { scale: 1, boxShadow: '0 0 0 0px transparent' }
        }
        transition={
          state === 'idle' || state === 'listening'
            ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        whileTap={isInteractive ? { scale: 0.93 } : {}}
      >
        <AnimatePresence mode="wait">
          {state === 'processing' ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: config.iconColor }}
                aria-hidden="true"
              />
            </motion.span>
          ) : (
            <motion.span
              key="mic"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Mic
                className="w-7 h-7"
                style={{ color: config.iconColor }}
                aria-hidden="true"
              />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* State label */}
      {config.label && (
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-xs font-medium text-[#4b5563] text-center"
          aria-live="polite"
          aria-atomic="true"
        >
          {config.label}
        </motion.p>
      )}
    </div>
  );
}

export { MicButton };
