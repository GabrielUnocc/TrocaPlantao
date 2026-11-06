export type Role = 'atendente' | 'gestor';
export type Nivel = 'N1' | 'N2' | 'N3' | 'Lider';
export type UserStatus = 'ativo' | 'ferias' | 'afastado' | 'inativo';

/** Linha crua da tabela users (contem o hash da senha). */
export type UserRow = {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  senha_hash: string;
  role: Role;
  nivel: Nivel;
  equipe: string | null;
  status: UserStatus;
  created_at: number;
  updated_at: number;
};

/** O que pode sair da API. Nunca inclui senha_hash. */
export type PublicUser = {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  role: Role;
  nivel: Nivel;
  equipe: string | null;
  status: UserStatus;
};

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    nome: row.nome,
    matricula: row.matricula,
    email: row.email,
    role: row.role,
    nivel: row.nivel,
    equipe: row.equipe,
    status: row.status,
  };
}
