import { env } from '../../config/env.js';
import { nowInSeconds } from '../../db/index.js';
import { conflict, forbidden, unauthorized } from '../../shared/errors.js';
import { burnTime, hashPassword, verifyPassword } from '../../shared/password.js';
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from '../../shared/tokens.js';
import { userRepository } from '../users/user.repository.js';
import { toPublicUser, type PublicUser, type UserRow } from '../users/user.types.js';
import { refreshTokenRepository } from './refresh-token.repository.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';

export type SessionTokens = {
  accessToken: string;
  tokenType: 'Bearer';
  /** Segundos de validade do access token. */
  expiresIn: number;
  refreshToken: string;
  /** Segundos de validade do refresh token. */
  refreshExpiresIn: number;
};

export type SessionResult = { user: PublicUser; tokens: SessionTokens };

/** Emite o par access + refresh. `familyId` mantem a linhagem na rotacao. */
function issueSession(
  user: UserRow,
  options: { userAgent?: string | null; familyId?: string } = {}
): SessionTokens {
  const { token, tokenHash } = generateRefreshToken();

  refreshTokenRepository.create({
    userId: user.id,
    tokenHash,
    familyId: options.familyId,
    ttlSeconds: env.REFRESH_TOKEN_TTL,
    userAgent: options.userAgent ?? null,
  });

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    matricula: user.matricula,
    nome: user.nome,
  });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: env.ACCESS_TOKEN_TTL,
    refreshToken: token,
    refreshExpiresIn: env.REFRESH_TOKEN_TTL,
  };
}

function assertUsable(user: UserRow) {
  if (user.status === 'inativo') {
    throw forbidden('USER_INACTIVE', 'Usuario inativo. Procure o gestor.');
  }
}

export const authService = {
  async register(input: RegisterInput, userAgent?: string | null): Promise<SessionResult> {
    if (userRepository.findByEmail(input.email)) {
      throw conflict('EMAIL_IN_USE', 'Este e-mail ja esta cadastrado.');
    }
    if (userRepository.findByMatricula(input.matricula)) {
      throw conflict('MATRICULA_IN_USE', 'Esta matricula ja esta cadastrada.');
    }

    const senhaHash = await hashPassword(input.senha);
    const user = userRepository.create({
      nome: input.nome,
      matricula: input.matricula,
      email: input.email,
      senhaHash,
      nivel: input.nivel,
      equipe: input.equipe ?? null,
      role: 'atendente', // promover a gestor e decisao administrativa, nunca do cadastro
    });

    return { user: toPublicUser(user), tokens: issueSession(user, { userAgent }) };
  },

  async login(input: LoginInput, userAgent?: string | null): Promise<SessionResult> {
    const user = userRepository.findByEmail(input.email);

    // Mesma mensagem e mesmo tempo de resposta para e-mail inexistente
    // e senha errada: nao entregamos quais e-mails existem.
    if (!user) {
      await burnTime(input.senha);
      throw unauthorized('INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
    }

    const senhaConfere = await verifyPassword(input.senha, user.senha_hash);
    if (!senhaConfere) {
      throw unauthorized('INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
    }

    assertUsable(user);

    return { user: toPublicUser(user), tokens: issueSession(user, { userAgent }) };
  },

  /**
   * Rotacao de refresh token.
   * Cada refresh queima o token usado e devolve um novo. Se um token ja
   * queimado aparecer de novo, assumimos roubo e derrubamos a familia toda.
   */
  async refresh(refreshToken: string, userAgent?: string | null): Promise<SessionResult> {
    const stored = refreshTokenRepository.findByHash(hashRefreshToken(refreshToken));

    if (!stored) {
      throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token invalido.');
    }

    if (stored.revoked_at !== null) {
      refreshTokenRepository.revokeFamily(stored.family_id);
      throw unauthorized(
        'REFRESH_TOKEN_REUSED',
        'Refresh token ja utilizado. Todas as sessoes foram encerradas por seguranca.'
      );
    }

    if (stored.expires_at <= nowInSeconds()) {
      refreshTokenRepository.revoke(stored.id);
      throw unauthorized('REFRESH_TOKEN_EXPIRED', 'Sessao expirada. Faca login novamente.');
    }

    const user = userRepository.findById(stored.user_id);
    if (!user) {
      refreshTokenRepository.revokeFamily(stored.family_id);
      throw unauthorized('REFRESH_TOKEN_INVALID', 'Refresh token invalido.');
    }
    assertUsable(user);

    const tokens = issueSession(user, { userAgent, familyId: stored.family_id });
    const novo = refreshTokenRepository.findByHash(hashRefreshToken(tokens.refreshToken));
    refreshTokenRepository.revoke(stored.id, novo?.id ?? null);

    return { user: toPublicUser(user), tokens };
  },

  /** Logout: invalida o refresh apresentado. O access morre sozinho no exp. */
  async logout(refreshToken: string): Promise<void> {
    const stored = refreshTokenRepository.findByHash(hashRefreshToken(refreshToken));
    if (stored && stored.revoked_at === null) {
      refreshTokenRepository.revoke(stored.id);
    }
  },

  /** Logout de todos os dispositivos. */
  async logoutAll(userId: string): Promise<void> {
    refreshTokenRepository.revokeAllForUser(userId);
  },

  me(userId: string): PublicUser {
    const user = userRepository.findById(userId);
    if (!user) {
      throw unauthorized('TOKEN_INVALID', 'Usuario do token nao existe mais.');
    }
    return toPublicUser(user);
  },
};
