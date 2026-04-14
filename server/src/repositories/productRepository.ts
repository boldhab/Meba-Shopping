import { prisma } from "../prisma/client";

export const productRepository = {
  async findAll(params: { categoryId?: string; search?: string; skip?: number; take?: number } = {}) {
    const { categoryId, search, skip = 0, take = 20 } = params;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total };
  },

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: { include: { user: true } } },
    });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },
};
