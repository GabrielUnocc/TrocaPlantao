import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { migrate, resetDatabase } from '../src/db/index.js';

export type TestApi = {
  url: string;
  close: () => Promise<void>;
  post: (path: string, body?: unknown, token?: string) => Promise<Resposta>;
  get: (path: string, token?: string) => Promise<Resposta>;
};

type Resposta = { status: number; body: any };

export async function startTestApi(): Promise<TestApi> {
  migrate();
  resetDatabase();

  const server: Server = await new Promise((resolve) => {
    const s = createApp().listen(0, () => resolve(s));
  });

  const address = server.address();
  const porta = typeof address === 'object' && address ? address.port : 0;
  const url = `http://127.0.0.1:${porta}`;

  async function request(method: string, path: string, body?: unknown, token?: string) {
    const response = await fetch(url + path, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const texto = await response.text();
    return { status: response.status, body: texto ? JSON.parse(texto) : null };
  }

  return {
    url,
    close: () => new Promise((resolve) => server.close(() => resolve())),
    post: (path, body, token) => request('POST', path, body, token),
    get: (path, token) => request('GET', path, undefined, token),
  };
}

export const novoUsuario = (sufixo = '1') => ({
  nome: 'Atendente de Teste',
  matricula: `MAT-TEST${sufixo}`,
  email: `teste${sufixo}@trocaplantao.com`,
  senha: 'senhaSegura123',
  nivel: 'N2' as const,
  equipe: 'Suporte TI',
});

export const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
