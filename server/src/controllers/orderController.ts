import type { Request, Response, NextFunction } from "express";
import { orderService } from "../services/orderService";
import { ApiError } from "../utils/apiError";

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const { shippingName, shippingAddress, shippingCity, shippingZip, shippingCountry } = req.body;

      if (!shippingName || !shippingAddress || !shippingCity || !shippingZip || !shippingCountry) {
        throw new ApiError(400, "Missing shipping details");
      }

      const order = await orderService.createOrder(userId, {
        shippingName,
        shippingAddress,
        shippingCity,
        shippingZip,
        shippingCountry,
      });

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },

  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const orders = await orderService.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  },

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const { id } = req.params;
      const order = await orderService.getOrderById(id, userId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  },
};
