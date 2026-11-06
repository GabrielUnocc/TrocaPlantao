import { randomUUID } from 'node:crypto';
import { db, nowInSeconds } from '../../db/index.js';
import type { Nivel, Role, UserRow } from './user.types.js';

export type CreateUserInput = {
  nome: string;
  matricula: string;
  email: string;
  senhaHash: string;
  role?: Role;
  nivel?: Nivel;
  equipe?: string | null;
};

export const userRepository = {
  findByEmail(email: string): UserRow | undefined {
    return db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.trim().toLowerCase()) as UserRow | undefined;
  },

  findById(id: string): UserRow | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  },

  findByMatricula(matricula: string): UserRow | undefined {
    return db
      .prepare('SELECT * FROM users WHERE matricula = ?')
      .get(matricula.trim().toUpperCase()) as UserRow | undefined;
  },

  create(input: CreateUserInput): UserRow {
    const now = nowInSeconds();
    const row: UserRow = {
      id: randomUUID(),
      nome: input.nome.trim(),
      matricula: input.matricula.trim().toUpperCase(),
      email: input.email.trim().toLowerCase(),
      senha_hash: input.senhaHash,
      role: input.role ?? 'atendente',
      nivel: input.nivel ?? 'N1',
      equipe: input.equipe?.trim() || null,
      status: 'ativo',
      created_at: now,
      updated_at: now,
    };

    db.prepare(
      `INSERT INTO users
         (id, nome, matricula, email, senha_hash, role, nivel, equipe, status, created_at, updated_at)
       VALUES
         (@id, @nome, @matricula, @email, @senha_hash, @role, @nivel, @equipe, @status, @created_at, @updated_at)`
    ).run(row);

    return row;
  },
};
