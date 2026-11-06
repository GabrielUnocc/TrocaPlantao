import { db } from '../src/db/index.js';
import { env } from '../src/config/env.js';

/**
 * Mostra o conteudo do banco provando que nao guardamos
 * senha nem refresh token em texto puro.
 */
console.log(`Banco: ${env.DATABASE_FILE}\n`);

console.log('== users ==');
console.table(
  db
    .prepare('SELECT nome, email, role, nivel, status, senha_hash FROM users')
    .all()
    .map((u: any) => ({ ...u, senha_hash: `${u.senha_hash.slice(0, 22)}... (bcrypt)` }))
);

console.log('== refresh_tokens ==');
console.table(
  db
    .prepare(
      `SELECT id, user_id, token_hash, family_id, expires_at, revoked_at, replaced_by
         FROM refresh_tokens ORDER BY created_at`
    )
    .all()
    .map((t: any) => ({
      id: t.id.slice(0, 8),
      usuario: t.user_id.slice(0, 8),
      token_hash: `${t.token_hash.slice(0, 16)}... (sha256)`,
      familia: t.family_id.slice(0, 8),
      expira_em: new Date(t.expires_at * 1000).toLocaleString('pt-BR'),
      revogado: t.revoked_at ? new Date(t.revoked_at * 1000).toLocaleString('pt-BR') : '-',
      rotacionado: t.replaced_by ? 'sim' : 'nao',
    }))
);
