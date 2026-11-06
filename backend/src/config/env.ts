import { z } from 'zod';

/**
 * Validacao das variaveis de ambiente.
 * Se faltar algo, o processo morre na inicializacao (fail fast) em vez de
 * quebrar no meio de uma requisicao.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3333),

  DATABASE_FILE: z.string().min(1).default('./data/trocaplantao.sqlite'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET precisa ter no minimo 32 caracteres'),
  JWT_ISSUER: z.string().min(1).default('trocaplantao-api'),
  JWT_AUDIENCE: z.string().min(1).default('trocaplantao-app'),

  ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(900),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),

  CORS_ORIGINS: z.string().default('http://localhost:8081'),

  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(10),
  LOGIN_RATE_WINDOW: z.coerce.number().int().positive().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variaveis de ambiente invalidas:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`);
  }
  console.error('\nCopie .env.example para .env e preencha os valores.');
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};

export type Env = typeof env;
