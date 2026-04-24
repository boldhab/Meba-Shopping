import { productRepository } from "../repositories/productRepository";
import { categoryRepository } from "../repositories/categoryRepository";
import { ApiError } from "../utils/apiError";
import { ProductStatus, DealType } from "@prisma/client";

const DEAL_TYPES = ["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"] as const;
const PRODUCT_SORTS = ["price-asc", "price-desc", "name-asc", "name-desc"] as const;
const ADMIN_PRODUCT_SORTS = ["newest", "oldest", "price-asc", "price-desc", "name-asc", "name-desc", "stock-asc", "stock-desc"] as const;

type ProductSort = (typeof PRODUCT_SORTS)[number];
type AdminProductSort = (typeof ADMIN_PRODUCT_SORTS)[number];

function parseDealType(input?: string): DealType | undefined {
  if (!input) return undefined;
  const normalized = input.toUpperCase();
  return DEAL_TYPES.find((type) => type === normalized) as DealType | undefined;
}

function parseBoolean(input?: string): boolean | undefined {
  if (input === undefined) return undefined;
  return input === "true";
}

function parseProductSort(input?: string): ProductSort | undefined {
  if (!input) return undefined;
  return PRODUCT_SORTS.find((sort) => sort === input) as ProductSort | undefined;
}

function parseAdminProductSort(input?: string): AdminProductSort | undefined {
  if (!input) return undefined;
  return ADMIN_PRODUCT_SORTS.find((sort) => sort === input) as AdminProductSort | undefined;
}

function parseProductStatus(input?: string): ProductStatus | undefined {
  if (!input || input === "ALL") return undefined;
  return Object.values(ProductStatus).find((status) => status === input) as ProductStatus | undefined;
}

export const productService = {
  async getAllProducts(query: {
    categoryId?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    dealType?: string;
    dealsOnly?: string;
    page?: string;
    limit?: string;
    sort?: string;
  }) {
    const skip = query.page ? (parseInt(query.page) - 1) * (parseInt(query.limit || "20")) : 0;
    const take = query.limit ? parseInt(query.limit) : 20;
    const minPrice = query.minPrice ? Number.parseFloat(query.minPrice) : undefined;
    const maxPrice = query.maxPrice ? Number.parseFloat(query.maxPrice) : undefined;

    return productRepository.findAll({
      categoryId: query.categoryId,
      search: query.search,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      dealType: parseDealType(query.dealType),
      dealsOnly: parseBoolean(query.dealsOnly),
      sort: parseProductSort(query.sort),
      skip,
      take,
      status: ProductStatus.ACTIVE, // Publicly show only active products
    });
  },

  async getProductBySlug(slug: string) {
    return productRepository.findBySlug(slug);
  },

  async getProductById(id: string) {
    return productRepository.findById(id);
  },

  async getActiveDeals(query: { dealType?: string; limit?: string }) {
    const take = query.limit ? parseInt(query.limit) : 100;

    return productRepository.findAll({
      dealType: parseDealType(query.dealType),
      dealsOnly: true,
      take: Number.isFinite(take) ? take : 100,
      skip: 0,
      status: ProductStatus.ACTIVE,
    });
  },

  async listProductsForAdminDeals() {
    return productRepository.findAll({ take: 300, skip: 0, includeInactive: true });
  },

  async listProductsForAdmin(query?: {
    search?: string;
    status?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    const pageNumber = query?.page ? Number.parseInt(query.page, 10) : 1;
    const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
    const limitNumber = query?.limit ? Number.parseInt(query.limit, 10) : 20;
    const take = Number.isFinite(limitNumber) && limitNumber > 0 ? Math.min(limitNumber, 100) : 20;
    const skip = (page - 1) * take;

    return productRepository.findAll({
      search: query?.search?.trim() || undefined,
      status: parseProductStatus(query?.status),
      sort: parseAdminProductSort(query?.sort),
      take,
      skip,
      includeInactive: true,
    });
  },

  async createProduct(input: {
    name: string;
    slug: string;
    imageUrl?: string | null;
    description?: string | null;
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
    const existingProduct = await productRepository.findAll({
      search: input.slug,
      take: 300,
      skip: 0,
      includeInactive: true,
    });
    const category = await categoryRepository.findById(input.categoryId);

    if (!category) {
      throw new ApiError(404, "Category not found.");
    }

    if (existingProduct.items.some((item) => item.slug === input.slug)) {
      throw new ApiError(409, "A product with that slug already exists.");
    }

    return productRepository.create({
      ...input,
      imageUrl: input.imageUrl?.trim() || null,
      description: input.description?.trim() || null,
    });
  },

  async updateProduct(
    productId: string,
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
    const existing = await productRepository.findById(productId);
    if (!existing) {
      return null;
    }

    if (input.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new ApiError(404, "Category not found.");
      }
    }

    if (input.slug) {
      const slugMatches = await productRepository.findAll({
        search: input.slug,
        take: 300,
        skip: 0,
        includeInactive: true,
      });

      if (slugMatches.items.some((item) => item.slug === input.slug && item.id !== productId)) {
        throw new ApiError(409, "A product with that slug already exists.");
      }
    }

    return productRepository.updateById(productId, {
      ...input,
      imageUrl: input.imageUrl === undefined ? undefined : input.imageUrl?.trim() || null,
      description: input.description === undefined ? undefined : input.description?.trim() || null,
    });
  },

  async updateProductDeal(
    productId: string,
    input: {
      dealType?: string | null;
      isDealActive?: boolean;
      dealStartAt?: string | null;
      dealEndAt?: string | null;
    }
  ) {
    const existing = await productRepository.findById(productId);
    if (!existing) {
      return null;
    }

    const parsedDealType =
      input.dealType === null ? null : parseDealType(input.dealType ?? undefined) ?? existing.dealType;
    const isDealActive = input.isDealActive ?? existing.isDealActive;
    const dealStartAt =
      input.dealStartAt === null
        ? null
        : input.dealStartAt
          ? new Date(input.dealStartAt)
          : existing.dealStartAt;
    const dealEndAt =
      input.dealEndAt === null
        ? null
        : input.dealEndAt
          ? new Date(input.dealEndAt)
          : existing.dealEndAt;

    return productRepository.updateDealByProductId(productId, {
      dealType: parsedDealType as DealType | null,
      isDealActive,
      dealStartAt,
      dealEndAt,
    });
  },

  async deleteProduct(productId: string) {
    return productRepository.deleteById(productId);
  },
};
