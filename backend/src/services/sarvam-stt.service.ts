import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface SttResult {
  transcript: string;
  language: string;
}

/**
 * Transcribe audio using Sarvam AI STT (saaras:v3).
 * Supports Kannada (kn-IN), Hindi (hi-IN), English (en-IN), Hinglish.
 *
 * @param audioBuffer  Raw audio bytes (webm/ogg/wav)
 * @param mimeType     MIME type of the audio, e.g. 'audio/webm'
 * @param language     BCP-47 language code, default 'kn-IN'
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string = 'audio/webm',
  language: string = 'kn-IN'
): Promise<SttResult> {
  if (!env.SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY is not configured');
  }

  const formData = new FormData();
  // Strip codec suffix: "audio/webm;codecs=opus" → "audio/webm" (Sarvam rejects the suffix)
  const cleanMimeType = mimeType.split(';')[0];
  // Use File (not Blob) — reliably forwards content-type + filename in Node 18 fetch
  const audioFile = new File([new Uint8Array(audioBuffer)], 'audio.webm', { type: cleanMimeType });
  formData.append('file', audioFile);
  formData.append('language_code', language);
  formData.append('model', 'saaras:v3');

  logger.debug({ language, bytes: audioBuffer.length }, '[Sarvam] Sending audio for transcription');

  const response = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: {
      'api-subscription-key': env.SARVAM_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error({ status: response.status, body: text }, '[Sarvam] STT request failed');
    throw new Error(`Sarvam STT failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { transcript: string; language_code: string };

  logger.debug(
    { transcript: data.transcript, language: data.language_code },
    '[Sarvam] Transcription complete'
  );

  return {
    transcript: data.transcript,
    language: data.language_code ?? language,
  };
}
