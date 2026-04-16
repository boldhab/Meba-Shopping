import { productRepository } from "../repositories/productRepository";

export const productService = {
  async getAllProducts(query: {
    categoryId?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
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
      skip,
      take,
    });
  },

  async getProductBySlug(slug: string) {
    return productRepository.findBySlug(slug);
  },
};
