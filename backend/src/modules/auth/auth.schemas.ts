import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().email('E-mail invalido.'));

/**
 * Limite de 72 caracteres: o bcrypt ignora qualquer byte depois disso.
 * Sem esse limite, "senha de 100 chars" e "os mesmos 72 primeiros chars"
 * virariam a mesma senha.
 */
const senha = z
  .string()
  .min(8, 'A senha precisa ter no minimo 8 caracteres.')
  .max(72, 'A senha pode ter no maximo 72 caracteres.');

export const registerSchema = z.object({
  nome: z.string().trim().min(3, 'Informe o nome completo.').max(120),
  matricula: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Matricula invalida.')
    .max(20, 'Matricula invalida.'),
  email,
  senha,
  nivel: z.enum(['N1', 'N2', 'N3', 'Lider']).default('N1'),
  equipe: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  email,
  senha: z.string().min(1, 'Informe a senha.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Informe o refreshToken.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
