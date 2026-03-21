import { motion } from 'framer-motion';

interface WaveformProps {
  active: boolean;
  amplitudes?: number[];
}

const BAR_COUNT = 5;
const BAR_DELAYS = [0, 0.2, 0.1, 0.3, 0.15];

export function Waveform({ active, amplitudes }: WaveformProps) {
  return (
    <div className="flex items-center justify-center gap-1" style={{ height: 48, width: 200 }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const amp = amplitudes?.[i] ?? 0;
        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ width: 4, backgroundColor: '#002970', originY: 0.5 }}
            animate={
              active
                ? { scaleY: amp > 0 ? amp : [0.3, 1, 0.3], opacity: 1 }
                : { scaleY: 0.3, opacity: 0.3 }
            }
            transition={
              active && amp === 0
                ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: BAR_DELAYS[i] }
                : { duration: 0.1 }
            }
            initial={{ height: 40, scaleY: 0.3, opacity: 0.3 }}
          />
        );
      })}
    </div>
  );
}
