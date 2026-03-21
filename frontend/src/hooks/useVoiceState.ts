import { useReducer, useCallback } from 'react';
import type { SaleItem } from '../types/sale';

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'   // parsing transcript via LLM
  | 'confirmation'
  | 'committing'   // committing sale to DB (distinct from parsing)
  | 'error'
  | 'committed';

type VoiceEvent =
  | { type: 'MIC_PRESSED' }
  | { type: 'TRANSCRIPT_RECEIVED'; transcript: string }
  | { type: 'SPEECH_ENDED' }
  | { type: 'PARSE_SUCCESS'; items: SaleItem[] }
  | { type: 'PARSE_ERROR'; error: string }
  | { type: 'USER_CONFIRMED' }
  | { type: 'USER_CORRECTED' }
  | { type: 'SALE_COMMITTED'; saleId: string }
  | { type: 'RESET' };

interface VoiceStateShape {
  state: VoiceState;
  transcript: string;
  errorMessage: string;
}

function reducer(current: VoiceStateShape, event: VoiceEvent): VoiceStateShape {
  switch (event.type) {
    case 'MIC_PRESSED':
      if (current.state === 'idle' || current.state === 'error') {
        return { ...current, state: 'listening', transcript: '', errorMessage: '' };
      }
      // Stop listening
      if (current.state === 'listening') {
        return { ...current, state: 'processing' };
      }
      return current;

    case 'TRANSCRIPT_RECEIVED':
      return { ...current, transcript: event.transcript };

    case 'SPEECH_ENDED':
      if (current.state === 'listening') {
        return { ...current, state: 'processing' };
      }
      return current;

    case 'PARSE_SUCCESS':
      return { ...current, state: 'confirmation' };

    case 'PARSE_ERROR':
      return { ...current, state: 'error', errorMessage: event.error };

    case 'USER_CONFIRMED':
      return { ...current, state: 'committing' };

    case 'USER_CORRECTED':
      return { ...current, state: 'listening', transcript: '' };

    case 'SALE_COMMITTED':
      return { ...current, state: 'committed' };

    case 'RESET':
      return { state: 'idle', transcript: '', errorMessage: '' };

    default:
      return current;
  }
}

export function useVoiceState() {
  const [voiceState, dispatch] = useReducer(reducer, {
    state: 'idle',
    transcript: '',
    errorMessage: '',
  });

  const send = useCallback((event: VoiceEvent) => {
    dispatch(event);
  }, []);

  return {
    state: voiceState.state,
    transcript: voiceState.transcript,
    errorMessage: voiceState.errorMessage,
    send,
  };
}
