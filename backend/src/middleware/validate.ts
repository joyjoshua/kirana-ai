import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

/**
 * Generic Zod validation middleware.
 * Validates req.body, req.params, and req.query against the provided schema.
 *
 * Usage:
 *   router.post('/endpoint', validate(mySchema), handler);
 */
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_FAILED',
        details: result.error.flatten((issue) => issue.message),
      });
      return;
    }

    // Propagate Zod-parsed values (defaults, coercions) back to the request
    const validated = result.data as {
      body?: Record<string, unknown>;
      params?: Record<string, string>;
    };
    if (validated.body !== undefined) req.body = validated.body;
    if (validated.params !== undefined) Object.assign(req.params, validated.params);

    next();
  };
}
