import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";

export const authController = {
  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.register(request.body);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.login(request.body);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.getCurrentUser(request.user!.id);
      response.status(200).json({ user: result });
    } catch (error) {
      next(error);
    }
  }
};
