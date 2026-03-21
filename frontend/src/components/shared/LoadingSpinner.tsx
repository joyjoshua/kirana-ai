interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LoadingSpinner({ size = 32, color = '#002970', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`rounded-full border-[3px] border-t-transparent animate-spin-arc ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: `${color}33`,
        borderTopColor: 'transparent',
        borderLeftColor: color,
        borderBottomColor: color,
        borderRightColor: color,
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SkeletonBlock({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-[12px] animate-skeleton ${className}`}
      style={{ backgroundColor: 'rgba(120, 120, 128, 0.12)', ...style }}
    />
  );
}
