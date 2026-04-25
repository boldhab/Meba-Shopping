import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { cartService } from "../services/cartService";

function getCartIdentifier(request: Request) {
  const userId = request.user?.id;
  const guestToken = request.headers["x-guest-token"];

  if (userId) return { userId };
  if (typeof guestToken === "string" && guestToken.trim()) return { guestToken: guestToken.trim() };

  throw new ApiError(401, "Authentication or guest token is required.");
}

export const cartController = {
  async getGuestQuote(request: Request, response: Response, next: NextFunction) {
    try {
      const body = request.body as { items?: unknown; couponCode?: unknown };
      const items = Array.isArray(body?.items) ? body.items : [];
      const couponCode = typeof body?.couponCode === "string" ? body.couponCode : undefined;

      const result = await cartService.getGuestCartQuote(items as any[], couponCode);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getCart(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.getCart(id);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getQuote(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.getCartQuote(id);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async applyCoupon(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const couponCode = typeof (request.body as any)?.couponCode === "string"
        ? (request.body as any).couponCode
        : undefined;

      const result = await cartService.applyCoupon(id, couponCode);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async removeCoupon(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.removeCoupon(id);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async addItem(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.addItem(id, request.body as any);
      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateItemQuantity(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.updateItemQuantity(id, request.body as any);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async removeItem(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.removeItem(id, request.body as any);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async clearCart(request: Request, response: Response, next: NextFunction) {
    try {
      const id = getCartIdentifier(request);
      const result = await cartService.clearCart(id);
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
