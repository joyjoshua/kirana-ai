import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import healthRouter from './routes/health.routes';
import salesRouter from './routes/sales.routes';
import inventoryRouter from './routes/inventory.routes';
import reorderRouter from './routes/reorder.routes';
import qrRouter from './routes/qr.routes';
import vendorsRouter from './routes/vendors.routes';
import authRouter from './routes/auth.routes';
import sttRouter from './routes/stt.routes';
import { logLlmProvider } from './services/llm.service';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

// Request logging (dev only)
if (env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, path: req.path }, 'Incoming request');
    next();
  });
}

// ─── Public Routes (no auth) ────────────────────────────────────────

app.use('/api', healthRouter);
app.use('/api', authRouter);

// ─── Protected Routes (Supabase JWT required) ───────────────────────

app.use('/api', authMiddleware, sttRouter);
app.use('/api', authMiddleware, salesRouter);
app.use('/api', authMiddleware, inventoryRouter);
app.use('/api', authMiddleware, reorderRouter);
app.use('/api', authMiddleware, qrRouter);
app.use('/api', authMiddleware, vendorsRouter);

// ─── Global Error Handler (must be last) ────────────────────────────

app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      env: env.NODE_ENV,
      cors: env.CORS_ORIGIN,
      llmProvider: env.LLM_PROVIDER,
    },
    `🚀 KiranaAI Backend running on port ${env.PORT}`
  );
  logLlmProvider(); // L6: log after app is fully initialised
});

// L5: Graceful shutdown — allow in-flight requests to complete
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutdown signal received');
  server.close(() => {
    logger.info('Server closed, exiting');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
