import api from './client';

export interface TranscribeResult {
  transcript: string;
  language: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Strip the "data:<mime>;base64," prefix
      resolve(dataUrl.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function transcribeAudio(
  audioBlob: Blob,
  language: string = 'kn-IN'
): Promise<TranscribeResult> {
  const audio_base64 = await blobToBase64(audioBlob);
  const { data } = await api.post<TranscribeResult>('/api/stt', {
    audio_base64,
    mime_type: audioBlob.type || 'audio/webm',
    language,
  });
  return data;
}
