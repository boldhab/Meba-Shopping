import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { cartService } from "../services/cartService";

export const cartController = {
  async getCart(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized.");
      }

      const result = await cartService.getUserCart(userId);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async addItem(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized.");
      }

      const result = await cartService.addItem(userId, request.body as any);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateItemQuantity(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized.");
      }

      const result = await cartService.updateItemQuantity(userId, request.body as any);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async removeItem(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized.");
      }

      const result = await cartService.removeItem(userId, request.body as any);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async clearCart(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized.");
      }

      const result = await cartService.clearCart(userId);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async mergeGuestCart(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized.");
      }

      const items = Array.isArray((request.body as any)?.items) ? (request.body as any).items : [];
      const result = await cartService.mergeGuestCart(userId, items);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },
};
