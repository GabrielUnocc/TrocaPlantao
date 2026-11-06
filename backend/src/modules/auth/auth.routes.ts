import { Router } from 'express';
import { env } from '../../config/env.js';
import { requireAuth } from '../../middlewares/require-auth.js';
import { loginRateKey, rateLimit } from '../../middlewares/rate-limit.js';
import { authController } from './auth.controller.js';

export const authRoutes = Router();

const loginLimiter = rateLimit({
  limit: env.LOGIN_RATE_LIMIT,
  windowSeconds: env.LOGIN_RATE_WINDOW,
  keyFrom: loginRateKey,
});

// Publicas
authRoutes.post('/register', authController.register);
authRoutes.post('/login', loginLimiter, authController.login);
authRoutes.post('/refresh', authController.refresh);
authRoutes.post('/logout', authController.logout);

// Protegidas (exigem access token valido)
authRoutes.get('/me', requireAuth, authController.me);
authRoutes.post('/logout-all', requireAuth, authController.logoutAll);
