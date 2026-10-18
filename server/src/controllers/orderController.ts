import type { Request, Response, NextFunction } from "express";
import { orderService } from "../services/orderService";
import { ApiError } from "../utils/apiError";
import { generateInvoice } from "../utils/generateInvoice";

export const orderController = {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || (req as any).user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const { shippingName, shippingAddress, shippingCity, shippingZip, shippingCountry, paymentMethod } = req.body;

      if (!shippingName || !shippingAddress || !shippingCity || !shippingZip || !shippingCountry) {
        throw new ApiError(400, "Missing shipping details");
      }

      const order = await orderService.createOrder(userId, {
        shippingName,
        shippingAddress,
        shippingCity,
        shippingZip,
        shippingCountry,
        paymentMethod,
      });

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },

  async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || (req as any).user?.userId;
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
      const userId = req.user?.id || (req as any).user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const { id } = req.params;
      const order = await orderService.getOrderById(String(id), userId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  },

  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id || (req as any).user?.userId;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const { id } = req.params;
      const isAdmin = req.user?.role === "ADMIN";
      const order = await orderService.getOrderForInvoice(String(id), userId, isAdmin);

      const pdfBuffer = generateInvoice(order);

      const filename = `invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", pdfBuffer.length);

      res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  },
};
