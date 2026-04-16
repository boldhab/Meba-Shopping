import { productRepository } from "../repositories/productRepository";
import { reviewRepository } from "../repositories/reviewRepository";
import { ApiError } from "../utils/apiError";

export const reviewService = {
  async createReview(input: { userId: string; productId: string; rating: number; comment?: string }) {
    const product = await productRepository.findById(input.productId);

    if (!product) {
      throw new ApiError(404, "Product not found.");
    }

    return reviewRepository.create(input);
  },
};
