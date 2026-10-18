import { prisma } from "../prisma/client";

export const categoryRepository = {
  async findAll() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  },

  async findAllWithCounts() {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return categories.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      productCount: c._count.products,
    }));
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

  async create(data: { name: string; slug: string }) {
    return prisma.category.create({
      data,
    });
  },

  async update(id: string, data: { name?: string; slug?: string }) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  },
};
