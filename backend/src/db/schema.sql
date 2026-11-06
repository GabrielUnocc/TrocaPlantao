-- Schema inicial da API do TrocaPlantao
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  nome          TEXT    NOT NULL,
  matricula     TEXT    NOT NULL UNIQUE,
  email         TEXT    NOT NULL UNIQUE,
  senha_hash    TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'atendente'
                        CHECK (role IN ('atendente', 'gestor')),
  nivel         TEXT    NOT NULL DEFAULT 'N1'
                        CHECK (nivel IN ('N1', 'N2', 'N3', 'Lider')),
  equipe        TEXT,
  status        TEXT    NOT NULL DEFAULT 'ativo'
                        CHECK (status IN ('ativo', 'ferias', 'afastado', 'inativo')),
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- Refresh tokens: guardamos apenas o HASH do token.
-- Se o banco vazar, ninguem consegue reusar os tokens.
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT    NOT NULL UNIQUE,
  family_id   TEXT    NOT NULL,
  expires_at  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  revoked_at  INTEGER,
  replaced_by TEXT,
  user_agent  TEXT
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user   ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
