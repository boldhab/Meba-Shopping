import { categoryRepository } from "../repositories/categoryRepository";

export const categoryService = {
  async getAllCategories() {
    return categoryRepository.findAll();
  },

  async getCategoryBySlug(slug: string) {
    return categoryRepository.findBySlug(slug);
  },
};
