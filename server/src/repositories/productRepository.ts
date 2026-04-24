import { prisma } from "../prisma/client";
import { ProductStatus, DealType, Prisma } from "@prisma/client";

type ProductSort = "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "stock-asc" | "stock-desc";

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
    sort?: ProductSort;
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
      sort,
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

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === "oldest"
        ? [{ createdAt: "asc" }]
        : sort === "price-asc"
        ? [{ price: "asc" }, { createdAt: "desc" }]
        : sort === "price-desc"
          ? [{ price: "desc" }, { createdAt: "desc" }]
          : sort === "name-asc"
            ? [{ name: "asc" }, { createdAt: "desc" }]
            : sort === "name-desc"
              ? [{ name: "desc" }, { createdAt: "desc" }]
              : sort === "stock-asc"
                ? [{ stock: "asc" }, { createdAt: "desc" }]
                : sort === "stock-desc"
                  ? [{ stock: "desc" }, { createdAt: "desc" }]
              : [{ createdAt: "desc" }];

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take,
        orderBy,
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
