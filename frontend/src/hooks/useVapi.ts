import { useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

interface UseVapiOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useVapi({ onTranscript, onCallEnd, onError }: UseVapiOptions = {}) {
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY as string;
    if (!publicKey || publicKey === 'your-vapi-public-key-here') {
      console.warn('[VAPI] No public key configured — voice will not work');
      return;
    }

    const vapi = new Vapi(publicKey);
    vapiRef.current = vapi;

    vapi.on('message', (message: Record<string, unknown>) => {
      if (message.type === 'transcript') {
        const isFinal = message.transcriptType === 'final';
        const text = (message.transcript as string) ?? '';
        onTranscript?.(text, isFinal);
      }
    });

    vapi.on('call-end', () => {
      onCallEnd?.();
    });

    vapi.on('error', (error: Error) => {
      onError?.(error);
    });

    return () => {
      vapi.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCall = useCallback(async () => {
    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID as string;
    if (!vapiRef.current || !assistantId || assistantId === 'your-vapi-assistant-id-here') {
      throw new Error('VAPI not configured. Set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID.');
    }
    await vapiRef.current.start(assistantId);
  }, []);

  const stopCall = useCallback(() => {
    vapiRef.current?.stop();
  }, []);

  return { startCall, stopCall };
}
