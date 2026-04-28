import type { NextFunction, Request, Response } from "express";
import { accountService } from "../services/accountService";
import { ApiError } from "../utils/apiError";

function getUserId(request: Request) {
  const userId = request.user?.id;
  if (!userId) {
    throw new ApiError(401, "Authorization token is missing.");
  }
  return userId;
}

export const accountController = {
  async getOrders(request: Request, response: Response, next: NextFunction) {
    try {
      const orders = await accountService.getOrders(getUserId(request));
      response.json({ items: orders });
    } catch (error) {
      next(error);
    }
  },

  async getOrder(request: Request, response: Response, next: NextFunction) {
    try {
      const order = await accountService.getOrder(getUserId(request), request.params.orderId);
      response.json(order);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(request: Request, response: Response, next: NextFunction) {
    try {
      const order = await accountService.cancelOrder(getUserId(request), request.params.orderId);
      response.json(order);
    } catch (error) {
      next(error);
    }
  },

  async returnOrder(request: Request, response: Response, next: NextFunction) {
    try {
      const order = await accountService.returnOrder(getUserId(request), request.params.orderId);
      response.json(order);
    } catch (error) {
      next(error);
    }
  },

  async getWishlist(request: Request, response: Response, next: NextFunction) {
    try {
      const wishlist = await accountService.getWishlist(getUserId(request));
      response.json({ items: wishlist });
    } catch (error) {
      next(error);
    }
  },

  async addWishlistItem(request: Request, response: Response, next: NextFunction) {
    try {
      const wishlist = await accountService.addWishlistItem(getUserId(request), request.body);
      response.status(201).json({ items: wishlist });
    } catch (error) {
      next(error);
    }
  },

  async updateWishlistItem(request: Request, response: Response, next: NextFunction) {
    try {
      const wishlist = await accountService.updateWishlistItem(getUserId(request), request.params.itemId, request.body);
      response.json({ items: wishlist });
    } catch (error) {
      next(error);
    }
  },

  async deleteWishlistItem(request: Request, response: Response, next: NextFunction) {
    try {
      const wishlist = await accountService.removeWishlistItem(getUserId(request), request.params.itemId);
      response.json({ items: wishlist });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(request: Request, response: Response, next: NextFunction) {
    try {
      const messages = await accountService.getMessages(getUserId(request));
      response.json({ items: messages, unreadCount: messages.filter((message) => !message.read && !message.archived).length });
    } catch (error) {
      next(error);
    }
  },

  async replyToMessage(request: Request, response: Response, next: NextFunction) {
    try {
      const message = await accountService.replyToMessage(getUserId(request), request.params.messageId, request.body.body);
      response.json(message);
    } catch (error) {
      next(error);
    }
  },

  async markMessageRead(request: Request, response: Response, next: NextFunction) {
    try {
      const message = await accountService.markMessageReadState(getUserId(request), request.params.messageId, request.body.read ?? true);
      response.json(message);
    } catch (error) {
      next(error);
    }
  },

  async archiveMessage(request: Request, response: Response, next: NextFunction) {
    try {
      const message = await accountService.archiveMessage(getUserId(request), request.params.messageId);
      response.json(message);
    } catch (error) {
      next(error);
    }
  },

  async deleteMessage(request: Request, response: Response, next: NextFunction) {
    try {
      const messages = await accountService.deleteMessage(getUserId(request), request.params.messageId);
      response.json({ items: messages });
    } catch (error) {
      next(error);
    }
  },

  async getSettings(request: Request, response: Response, next: NextFunction) {
    try {
      const settings = await accountService.getSettings(getUserId(request));
      response.json(settings);
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(request: Request, response: Response, next: NextFunction) {
    try {
      const settings = await accountService.updateSettings(getUserId(request), request.body);
      response.json(settings);
    } catch (error) {
      next(error);
    }
  },
};
