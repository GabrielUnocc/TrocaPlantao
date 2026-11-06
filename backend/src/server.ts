import { createApp } from './app.js';
import { env } from './config/env.js';
import { migrate } from './db/index.js';
import { refreshTokenRepository } from './modules/auth/refresh-token.repository.js';

migrate();
refreshTokenRepository.deleteExpired();

const app = createApp();

const server = app.listen(env.PORT, () => {
  const address = server.address();
  const porta = typeof address === 'object' && address ? address.port : env.PORT;
  console.log(`TrocaPlantao API rodando em http://localhost:${porta}  [${env.NODE_ENV}]`);
  console.log(`Health check:  http://localhost:${porta}/health`);
});

for (const sinal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sinal, () => {
    console.log(`\nRecebido ${sinal}, encerrando...`);
    server.close(() => process.exit(0));
  });
}
