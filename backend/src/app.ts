import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { requireAuth, requireRole } from './middlewares/require-auth.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // req.ip correto atras de proxy/ngrok
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Apps nativos (Expo Go) nao mandam Origin: liberamos quando ausente.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origem nao permitida pelo CORS: ${origin}`));
      },
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  });

  app.use('/auth', authRoutes);

  // Exemplo de rota com papel: so gestor entra.
  app.get('/gestor/ping', requireAuth, requireRole('gestor'), (req, res) => {
    res.json({ ok: true, gestor: req.user!.nome });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
