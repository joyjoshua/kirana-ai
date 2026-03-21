import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Custom error for insufficient stock — thrown by inventory service.
 */
export class InsufficientStockError extends Error {
  constructor(public skuId: string) {
    super(`Insufficient stock for item ${skuId}`);
    this.name = 'InsufficientStockError';
  }
}

/**
 * Custom error for resources not found.
 */
export class NotFoundError extends Error {
  constructor(public resource: string, public resourceId: string) {
    super(`${resource} not found: ${resourceId}`);
    this.name = 'NotFoundError';
  }
}

/**
 * Global error handler middleware — must be registered LAST.
 *
 * Catches all unhandled errors, logs them, and returns a consistent
 * JSON error response shape.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(
    { err, path: req.path, method: req.method },
    'Unhandled error'
  );

  // Known error: insufficient stock
  if (err instanceof InsufficientStockError) {
    res.status(400).json({
      error: `Not enough stock for item ${err.skuId}`,
      code: 'INSUFFICIENT_STOCK',
      details: { sku_id: err.skuId },
    });
    return;
  }

  // Known error: resource not found
  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
      code: 'NOT_FOUND',
      details: { resource: err.resource, id: err.resourceId },
    });
    return;
  }

  // LLM service errors — OpenAI SDK APIError, LM Studio down, or provider failures
  const asAny = err as { status?: number; name?: string };
  if (
    err.name === 'APIError' ||
    err.name === 'AnthropicError' ||
    (asAny.status !== undefined && asAny.status >= 500) ||
    err.message?.includes('ECONNREFUSED') ||
    err.message?.includes('fetch failed') ||
    err.message?.includes('Connection error') ||
    err.message?.includes('Provider error')
  ) {
    res.status(502).json({
      error: 'AI service temporarily unavailable',
      code: 'AI_UNAVAILABLE',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
    });
    return;
  }

  // Sarvam STT errors — surface the actual API response in dev
  if (err.message?.startsWith('Sarvam STT failed:')) {
    res.status(502).json({
      error: 'Speech-to-text service error',
      code: 'STT_ERROR',
      ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
    });
    return;
  }

  // Fallback: generic 500 (expose message in dev for debugging)
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV !== 'production' && { details: err.message }),
  });
}
