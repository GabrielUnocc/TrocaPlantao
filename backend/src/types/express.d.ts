import type { AccessTokenPayload } from '../shared/tokens.js';

declare global {
  namespace Express {
    interface Request {
      /** Preenchido pelo middleware requireAuth. */
      user?: AccessTokenPayload;
    }
  }
}

export {};
