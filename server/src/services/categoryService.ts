import { categoryRepository } from "../repositories/categoryRepository";
import { ApiError } from "../utils/apiError";

export const categoryService = {
  async getAllCategories() {
    return categoryRepository.findAll();
  },

  async getAllCategoriesWithCounts() {
    return categoryRepository.findAllWithCounts();
  },

  async getCategoryBySlug(slug: string) {
    return categoryRepository.findBySlug(slug);
  },

  async getCategoryById(id: string) {
    return categoryRepository.findById(id);
  },

  async createCategory(input: { name: string; slug?: string }) {
    const name = input.name.trim();
    if (!name) {
      throw new ApiError(400, "Category name is required.");
    }

    const slug = (input.slug?.trim() || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const existing = await categoryRepository.findBySlug(slug);
    if (existing) {
      throw new ApiError(409, `Category with slug '${slug}' already exists.`);
    }

    return categoryRepository.create({ name, slug });
  },

  async updateCategory(id: string, input: { name?: string; slug?: string }) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Category not found.");
    }

    const data: { name?: string; slug?: string } = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new ApiError(400, "Category name cannot be empty.");
      data.name = name;
    }

    if (input.slug !== undefined) {
      const slug = input.slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (!slug) throw new ApiError(400, "Category slug cannot be empty.");
      if (slug !== existing.slug) {
        const slugConflict = await categoryRepository.findBySlug(slug);
        if (slugConflict && slugConflict.id !== id) {
          throw new ApiError(409, `Category with slug '${slug}' already exists.`);
        }
      }
      data.slug = slug;
    }

    return categoryRepository.update(id, data);
  },

  async deleteCategory(id: string) {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, "Category not found.");
    }

    return categoryRepository.delete(id);
  },
};
