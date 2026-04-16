import { requestApi } from "./client";
import type { ProductReview } from "./products";

type CreateReviewInput = {
  token: string;
  productId: string;
  rating: number;
  comment: string;
};

export async function createReview(input: CreateReviewInput): Promise<{ review: ProductReview }> {
  return requestApi<{ review: ProductReview }>("/reviews", {
    method: "POST",
    token: input.token,
    body: {
      productId: input.productId,
      rating: input.rating,
      comment: input.comment,
    },
  });
}
