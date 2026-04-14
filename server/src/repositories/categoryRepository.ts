import { prisma } from "../prisma/client";

export const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: { products: true },
    });
  },

  async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
    });
  },
};
