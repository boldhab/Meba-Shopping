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
  }
};
