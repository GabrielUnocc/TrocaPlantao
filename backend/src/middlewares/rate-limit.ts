import type { NextFunction, Request, Response } from 'express';
import { tooManyRequests } from '../shared/errors.js';

type Bucket = { count: number; resetAt: number };

/**
 * Limitador simples em memoria, suficiente para 1 instancia (o caso deste projeto).
 * Em producao com varias instancias, trocar por Redis (ex.: express-rate-limit + store).
 */
export function rateLimit(options: {
  limit: number;
  windowSeconds: number;
  keyFrom?: (req: Request) => string;
}) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyFrom?.(req) ?? req.ip ?? 'desconhecido';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
      return next();
    }

    bucket.count += 1;

    if (bucket.count > options.limit) {
      const segundos = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(segundos));
      return next(
        tooManyRequests(
          'TOO_MANY_REQUESTS',
          `Muitas tentativas. Tente novamente em ${segundos}s.`
        )
      );
    }

    next();
  };
}

/** Chave por IP + e-mail: nao deixa um atacante travar a conta alheia so pelo e-mail. */
export const loginRateKey = (req: Request) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.toLowerCase() : '';
  return `${req.ip ?? 'ip'}|${email}`;
};
