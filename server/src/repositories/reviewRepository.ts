import { prisma } from "../prisma/client";

export const reviewRepository = {
  async create(input: { userId: string; productId: string; rating: number; comment?: string }) {
    return prisma.review.create({
      data: {
        userId: input.userId,
        productId: input.productId,
        rating: input.rating,
        comment: input.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },
};
