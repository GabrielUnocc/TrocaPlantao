import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../shared/errors.js';
import { verifyAccessToken } from '../shared/tokens.js';
import type { Role } from '../modules/users/user.types.js';

/** Exige `Authorization: Bearer <access token>` valido e nao expirado. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');

  if (!header?.startsWith('Bearer ')) {
    return next(
      unauthorized('TOKEN_MISSING', 'Envie o header Authorization: Bearer <token>.')
    );
  }

  try {
    req.user = verifyAccessToken(header.slice('Bearer '.length).trim());
    next();
  } catch (error) {
    next(error);
  }
}

/** Usar sempre depois de requireAuth. Ex.: router.get('/x', requireAuth, requireRole('gestor')) */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized('TOKEN_MISSING', 'Autenticacao obrigatoria.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        unauthorized('FORBIDDEN_ROLE', 'Seu perfil nao tem acesso a este recurso.')
      );
    }
    next();
  };
}
