import { prisma } from "../prisma/client";

export const reviewRepository = {
  async create(input: { userId: string; productId: string; rating: number; comment?: string }) {
    return prisma.review.create({
      data: {
        userId: input.userId,
        productId: input.productId,
        rating: input.rating,
        comment: input.comment,
        status: "APPROVED",
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

  async findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId, status: "APPROVED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findAll() {
    return prisma.review.findMany({
      where: { status: "APPROVED" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
