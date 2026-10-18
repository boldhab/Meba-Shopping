import type { NextFunction, Request, Response } from "express";
import { paymentService } from "../services/paymentService";
import { ApiError } from "../utils/apiError";

export const paymentController = {
  async createIntent(request: Request, response: Response, next: NextFunction) {
    try {
      const { orderId } = request.body;
      const userId = request.user?.id;
      if (!orderId) {
        throw new ApiError(400, "orderId is required.");
      }
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }
      
      const intentData = await paymentService.createPaymentIntent(orderId, userId);
      response.json(intentData);
    } catch (error) {
      next(error);
    }
  },

  async createMobileIntent(request: Request, response: Response, next: NextFunction) {
    try {
      const { orderId, provider, mobileNumber } = request.body;
      const userId = request.user?.id;
      if (!orderId) {
        throw new ApiError(400, "orderId is required.");
      }
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }
      if (!provider || (provider !== "telebirr" && provider !== "cbebirr")) {
        throw new ApiError(400, "Valid provider ('telebirr' or 'cbebirr') is required.");
      }

      const mobileData = await paymentService.createMobileMoneyPayment(orderId, userId, provider, mobileNumber);
      response.json(mobileData);
    } catch (error) {
      next(error);
    }
  },

  async verifyPayment(request: Request, response: Response, next: NextFunction) {
    try {
      const { orderId } = request.params;
      const userId = request.user?.id;
      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const result = await paymentService.verifyPayment(String(orderId), userId);
      response.json(result);
    } catch (error) {
      next(error);
    }
  }
};
