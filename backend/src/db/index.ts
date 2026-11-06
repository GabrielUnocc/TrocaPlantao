import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const here = dirname(fileURLToPath(import.meta.url));

function openDatabase() {
  if (env.DATABASE_FILE !== ':memory:') {
    mkdirSync(dirname(resolve(env.DATABASE_FILE)), { recursive: true });
  }

  const database = new Database(env.DATABASE_FILE);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  return database;
}

export const db = openDatabase();

/** Aplica o schema. Idempotente: pode rodar quantas vezes quiser. */
export function migrate() {
  const sql = readFileSync(resolve(here, 'schema.sql'), 'utf8');
  db.exec(sql);
}

/** Usado nos testes para comecar de um estado limpo. */
export function resetDatabase() {
  db.exec('DELETE FROM refresh_tokens; DELETE FROM users;');
}

export const nowInSeconds = () => Math.floor(Date.now() / 1000);
