import { prisma } from "../prisma/client";
import { ProductStatus, DealType } from "@prisma/client";

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
    dealType?: DealType;
    dealsOnly?: boolean;
    status?: ProductStatus;
    isFeatured?: boolean;
    skip?: number;
    take?: number;
    includeInactive?: boolean;
  } = {}) {
    const { 
      categoryId, 
      search, 
      minPrice, 
      maxPrice, 
      dealType, 
      dealsOnly, 
      status, 
      isFeatured,
      skip = 0, 
      take = 20,
      includeInactive = false
    } = params;

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

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (status) {
      where.status = status;
    } else if (!includeInactive) {
      where.status = ProductStatus.ACTIVE;
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
      include: { 
        category: true, 
        reviews: { 
          where: { status: "APPROVED" },
          include: { user: true } 
        } 
      },
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
    imageUrl: string | null;
    description: string | null;
    price: number;
    stock: number;
    categoryId: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    attributes?: any;
  }) {
    return prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        imageUrl: input.imageUrl,
        description: input.description,
        price: input.price,
        stock: input.stock,
        categoryId: input.categoryId,
        status: input.status || ProductStatus.DRAFT,
        isFeatured: input.isFeatured ?? false,
        allowBackorder: input.allowBackorder ?? false,
        lowStockThreshold: input.lowStockThreshold ?? 10,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        attributes: input.attributes || {},
      },
      include: { category: true },
    });
  },

  async updateById(
    id: string,
    input: {
      name?: string;
      slug?: string;
      imageUrl?: string | null;
      description?: string | null;
      price?: number;
      stock?: number;
      categoryId?: string;
      status?: ProductStatus;
      isFeatured?: boolean;
      allowBackorder?: boolean;
      lowStockThreshold?: number;
      seoTitle?: string | null;
      seoDescription?: string | null;
      seoKeywords?: string | null;
      attributes?: any;
    }
  ) {
    return prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        imageUrl: input.imageUrl,
        description: input.description,
        price: input.price,
        stock: input.stock,
        categoryId: input.categoryId,
        status: input.status,
        isFeatured: input.isFeatured,
        allowBackorder: input.allowBackorder,
        lowStockThreshold: input.lowStockThreshold,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        seoKeywords: input.seoKeywords,
        attributes: input.attributes,
      },
      include: { category: true },
    });
  },

  async updateDealByProductId(
    id: string,
    input: {
      dealType: DealType | null;
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

  async deleteById(id: string) {
    // Soft delete by setting status to ARCHIVED
    return prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });
  },

  async permanentlyDeleteById(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  },
};
