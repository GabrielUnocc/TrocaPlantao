import { randomUUID } from 'node:crypto';
import { db, nowInSeconds } from '../../db/index.js';

export type RefreshTokenRow = {
  id: string;
  user_id: string;
  token_hash: string;
  family_id: string;
  expires_at: number;
  created_at: number;
  revoked_at: number | null;
  replaced_by: string | null;
  user_agent: string | null;
};

export const refreshTokenRepository = {
  create(input: {
    userId: string;
    tokenHash: string;
    familyId?: string;
    ttlSeconds: number;
    userAgent?: string | null;
  }): RefreshTokenRow {
    const now = nowInSeconds();
    const id = randomUUID();
    const row: RefreshTokenRow = {
      id,
      user_id: input.userId,
      token_hash: input.tokenHash,
      family_id: input.familyId ?? id,
      expires_at: now + input.ttlSeconds,
      created_at: now,
      revoked_at: null,
      replaced_by: null,
      user_agent: input.userAgent ?? null,
    };

    db.prepare(
      `INSERT INTO refresh_tokens
         (id, user_id, token_hash, family_id, expires_at, created_at, revoked_at, replaced_by, user_agent)
       VALUES
         (@id, @user_id, @token_hash, @family_id, @expires_at, @created_at, @revoked_at, @replaced_by, @user_agent)`
    ).run(row);

    return row;
  },

  findByHash(tokenHash: string): RefreshTokenRow | undefined {
    return db
      .prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?')
      .get(tokenHash) as RefreshTokenRow | undefined;
  },

  revoke(id: string, replacedBy?: string | null) {
    db.prepare('UPDATE refresh_tokens SET revoked_at = ?, replaced_by = ? WHERE id = ?').run(
      nowInSeconds(),
      replacedBy ?? null,
      id
    );
  },

  /** Mata a arvore inteira de tokens: usado na deteccao de reuso e no logout total. */
  revokeFamily(familyId: string) {
    db.prepare(
      'UPDATE refresh_tokens SET revoked_at = ? WHERE family_id = ? AND revoked_at IS NULL'
    ).run(nowInSeconds(), familyId);
  },

  revokeAllForUser(userId: string) {
    db.prepare(
      'UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL'
    ).run(nowInSeconds(), userId);
  },

  /** Limpeza de tokens vencidos ha mais de 30 dias. */
  deleteExpired(): number {
    const cutoff = nowInSeconds() - 60 * 60 * 24 * 30;
    return db.prepare('DELETE FROM refresh_tokens WHERE expires_at < ?').run(cutoff).changes;
  },
};
