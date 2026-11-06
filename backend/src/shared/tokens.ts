import { randomBytes, createHash, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from './errors.js';

export type AccessTokenPayload = {
  sub: string;
  role: 'atendente' | 'gestor';
  matricula: string;
  nome: string;
};

/* ------------------------------------------------------------------ */
/* Access token: JWT curto, assinado em HS256, nao fica no banco.      */
/* ------------------------------------------------------------------ */

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.ACCESS_TOKEN_TTL,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    jwtid: randomUUID(),
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload & { exp: number } {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }) as AccessTokenPayload & { exp: number };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw unauthorized('TOKEN_EXPIRED', 'Access token expirado. Use /auth/refresh.');
    }
    throw unauthorized('TOKEN_INVALID', 'Access token invalido.');
  }
}

/* ------------------------------------------------------------------ */
/* Refresh token: valor opaco e aleatorio. O banco guarda so o hash.   */
/* ------------------------------------------------------------------ */

export function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashRefreshToken(token) };
}

/**
 * SHA-256 e suficiente aqui (e proposital nao usar bcrypt):
 * o token tem 256 bits de entropia aleatoria, nao e uma senha
 * adivinhavel, e o refresh precisa ser rapido.
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
