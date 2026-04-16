import type { NextFunction, Request, Response } from "express";
import { reviewService } from "../services/reviewService";
import { ApiError } from "../utils/apiError";

export const reviewController = {
  async list(_request: Request, response: Response) {
    response.status(200).json({ resource: "reviews" });
  },

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;

      if (!userId) {
        throw new ApiError(401, "Authorization token is missing.");
      }

      const review = await reviewService.createReview({
        userId,
        productId: request.body.productId,
        rating: request.body.rating,
        comment: request.body.comment,
      });

      response.status(201).json({ review });
    } catch (error) {
      next(error);
    }
  },
};
