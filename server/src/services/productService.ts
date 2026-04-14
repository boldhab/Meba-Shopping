import { productRepository } from "../repositories/productRepository";

export const productService = {
  async getAllProducts(query: { categoryId?: string; search?: string; page?: string; limit?: string }) {
    const skip = query.page ? (parseInt(query.page) - 1) * (parseInt(query.limit || "20")) : 0;
    const take = query.limit ? parseInt(query.limit) : 20;

    return productRepository.findAll({
      categoryId: query.categoryId,
      search: query.search,
      skip,
      take,
    });
  },

  async getProductBySlug(slug: string) {
    return productRepository.findBySlug(slug);
  },
};
