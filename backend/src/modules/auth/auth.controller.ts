import type { Request, Response } from 'express';
import { parseBody } from '../../shared/validate.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import { authService } from './auth.service.js';

const agent = (req: Request) => req.header('user-agent') ?? null;

export const authController = {
  async register(req: Request, res: Response) {
    const input = parseBody(registerSchema, req.body);
    const result = await authService.register(input, agent(req));
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const input = parseBody(loginSchema, req.body);
    const result = await authService.login(input, agent(req));
    res.status(200).json(result);
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = parseBody(refreshSchema, req.body);
    const result = await authService.refresh(refreshToken, agent(req));
    res.status(200).json(result);
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = parseBody(refreshSchema, req.body);
    await authService.logout(refreshToken);
    res.status(204).send();
  },

  async logoutAll(req: Request, res: Response) {
    await authService.logoutAll(req.user!.sub);
    res.status(204).send();
  },

  async me(req: Request, res: Response) {
    res.status(200).json({ user: authService.me(req.user!.sub) });
  },
};
