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
      className="rounded-[12px] px-4 py-3 relative overflow-hidden"
      style={{ backgroundColor: 'rgba(120, 120, 128, 0.08)' }}
      aria-live="polite"
      aria-label="Voice transcript"
    >
      <p className="text-[17px] text-[#1C1C1E] tracking-[-0.43px] min-h-[26px]">
        {transcript || (
          <span className="text-[#8E8E93]">Say your sale… (e.g., "Atta 2 kilo, Maggi teen packet")</span>
        )}
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
