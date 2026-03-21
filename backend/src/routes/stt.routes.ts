import { Router } from 'express';
import { z } from 'zod';
import { transcribeAudio } from '../services/sarvam-stt.service';
import { logger } from '../utils/logger';

const router = Router();

const sttSchema = z.object({
  audio_base64: z.string().min(1),
  mime_type: z.string().default('audio/webm'),
  language: z.string().default('kn-IN'),
});

/**
 * POST /api/stt
 * Accepts base64-encoded audio, forwards to Sarvam AI STT.
 * Returns { transcript, language }.
 */
router.post('/stt', async (req, res, next) => {
  try {
    const parsed = sttSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.issues });
      return;
    }

    const { audio_base64, mime_type, language } = parsed.data;
    const audioBuffer = Buffer.from(audio_base64, 'base64');

    if (audioBuffer.length === 0) {
      res.status(400).json({ error: 'Audio data is empty' });
      return;
    }

    logger.info({ bytes: audioBuffer.length, language }, '[STT] Transcription request');

    const result = await transcribeAudio(audioBuffer, mime_type, language);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
