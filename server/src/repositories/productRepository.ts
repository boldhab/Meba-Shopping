import { prisma } from "../prisma/client";

function buildActiveDealClauses(now: Date) {
  return [
    { isDealActive: true },
    {
      OR: [
        { dealStartAt: null },
        { dealStartAt: { lte: now } },
      ],
    },
    {
      OR: [
        { dealEndAt: null },
        { dealEndAt: { gte: now } },
      ],
    },
  ];
}

export const productRepository = {
  async findAll(params: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    dealType?: "DAILY" | "WEEKLY" | "CLEARANCE" | "CEREMONY";
    dealsOnly?: boolean;
    skip?: number;
    take?: number;
  } = {}) {
    const { categoryId, search, minPrice, maxPrice, dealType, dealsOnly, skip = 0, take = 20 } = params;

    const where: any = {};
    const andClauses: any[] = [];

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (dealType) {
      where.dealType = dealType;
    }

    if (dealsOnly) {
      andClauses.push(...buildActiveDealClauses(new Date()));
    }

    if (andClauses.length > 0) {
      where.AND = [...(where.AND ?? []), ...andClauses];
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

  async create(input: {
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    categoryId: string;
  }) {
    return prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        stock: input.stock,
        categoryId: input.categoryId,
      },
      include: { category: true },
    });
  },

  async updateById(
    id: string,
    input: {
      name: string;
      slug: string;
      description: string | null;
      price: number;
      stock: number;
      categoryId: string;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        stock: input.stock,
        categoryId: input.categoryId,
      },
      include: { category: true },
    });
  },

  async updateDealByProductId(
    id: string,
    input: {
      dealType: "DAILY" | "WEEKLY" | "CLEARANCE" | "CEREMONY" | null;
      isDealActive: boolean;
      dealStartAt: Date | null;
      dealEndAt: Date | null;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data: {
        dealType: input.dealType,
        isDealActive: input.isDealActive,
        dealStartAt: input.dealStartAt,
        dealEndAt: input.dealEndAt,
      },
      include: { category: true },
    });
  },
};
