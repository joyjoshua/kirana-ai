interface TranscriptDisplayProps {
  transcript: string;
  confidence?: 'high' | 'medium' | 'low' | null;
}

const confidenceColor = {
  high: '#00A86B',
  medium: '#F5A623',
  low: '#E53935',
};

export function TranscriptDisplay({ transcript, confidence }: TranscriptDisplayProps) {
  return (
    <div
      className="w-full rounded-[16px] px-6 py-5 relative overflow-hidden"
      style={{ backgroundColor: 'rgba(120, 120, 128, 0.08)' }}
      aria-live="polite"
      aria-label="Voice transcript"
    >
      <p className="text-[20px] text-[#1C1C1E] tracking-[-0.4px] leading-snug min-h-[30px]">
        {transcript}
      </p>
      {confidence && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
          style={{ backgroundColor: confidenceColor[confidence] }}
        />
      )}
    </div>
  );
}
