import { productRepository } from "../repositories/productRepository";

const DEAL_TYPES = ["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"] as const;

type DealType = (typeof DEAL_TYPES)[number];

function parseDealType(input?: string): DealType | undefined {
  if (!input) return undefined;
  const normalized = input.toUpperCase();
  return DEAL_TYPES.find((type) => type === normalized);
}

function parseBoolean(input?: string): boolean | undefined {
  if (input === undefined) return undefined;
  return input === "true";
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
      skip,
      take,
    });
  },

  async getProductBySlug(slug: string) {
    return productRepository.findBySlug(slug);
  },

  async getActiveDeals(query: { dealType?: string; limit?: string }) {
    const take = query.limit ? parseInt(query.limit) : 100;

    return productRepository.findAll({
      dealType: parseDealType(query.dealType),
      dealsOnly: true,
      take: Number.isFinite(take) ? take : 100,
      skip: 0,
    });
  },

  async listProductsForAdminDeals() {
    return productRepository.findAll({ take: 300, skip: 0 });
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
      dealType: parsedDealType,
      isDealActive,
      dealStartAt,
      dealEndAt,
    });
  },
};
