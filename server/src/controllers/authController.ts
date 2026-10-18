import type { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { ApiError } from "../utils/apiError";
import { env } from "../config/env";

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(response: Response, token: string) {
  response.cookie("token", token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

function clearAuthCookie(response: Response) {
  response.clearCookie("token", {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
  });
}

export const authController = {
  async requestEmailVerification(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.requestEmailVerification(request.body);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.register(request.body);
      setAuthCookie(response, result.token);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.login(request.body);
      setAuthCookie(response, result.token);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async logout(_request: Request, response: Response, next: NextFunction) {
    try {
      clearAuthCookie(response);
      response.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  },

  async googleStart(_request: Request, response: Response, next: NextFunction) {
    try {
      const authUrl = await authService.createGoogleAuthUrl();
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

  async me(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.getCurrentUser(request.user!.id);
      response.status(200).json({ user: result });
    } catch (error) {
      next(error);
    }
  },

  async requestPasswordReset(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.requestPasswordReset(request.body);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async confirmPasswordReset(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await authService.confirmPasswordReset(request.body);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async exchangeOAuthCode(request: Request, response: Response, next: NextFunction) {
    try {
      const { code } = request.body;
      if (!code || typeof code !== "string") {
        response.status(400).json({ message: "Authorization code is required." });
        return;
      }
      const result = await authService.exchangeOAuthCode(code);
      setAuthCookie(response, result.token);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id || (request as any).user?.userId;
      if (!userId) {
        response.status(401).json({ message: "Unauthorized." });
        return;
      }
      const result = await authService.changePassword(userId, request.body);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
