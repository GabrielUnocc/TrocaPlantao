import { z } from 'zod';
import { badRequest } from './errors.js';

export type FieldError = { campo: string; mensagem: string };

export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);

  if (!result.success) {
    const details: FieldError[] = result.error.issues.map((issue) => ({
      campo: issue.path.join('.') || '(corpo)',
      mensagem: issue.message,
    }));
    throw badRequest('VALIDATION_ERROR', 'Dados invalidos.', details);
  }

  return result.data;
}
