import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { ApiError } from "../utils/apiError";

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

  async googleStart(_request: Request, response: Response, next: NextFunction) {
    try {
      const authUrl = authService.createGoogleAuthUrl();
      response.redirect(authUrl);
    } catch (error) {
      next(error);
    }
  },

  async googleCallback(request: Request, response: Response, next: NextFunction) {
    try {
      const code = typeof request.query.code === "string" ? request.query.code : undefined;
      const state = typeof request.query.state === "string" ? request.query.state : undefined;

      if (!code || !state) {
        throw new ApiError(400, "Google callback is missing required parameters.");
      }

      const redirectUrl = await authService.googleCallback({ code, state });
      response.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  },

  async requestPhoneOtp(request: Request, response: Response, next: NextFunction) {
    try {
      const result = authService.requestPhoneOtp(request.body);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async verifyPhoneOtp(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.verifyPhoneOtp(request.body);
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
