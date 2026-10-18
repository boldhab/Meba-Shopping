import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { categoryService } from "../services/categoryService";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

export const categoryController = {
  async list(_request: Request, response: Response, next: NextFunction) {
    try {
      const result = await categoryService.getAllCategories();
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listAdmin(_request: Request, response: Response, next: NextFunction) {
    try {
      const result = await categoryService.getAllCategoriesWithCounts();
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(request: Request, response: Response, next: NextFunction) {
    try {
      const { slug } = request.params;
      const category = await categoryService.getCategoryBySlug(slug as string);
      if (!category) {
        return response.status(404).json({ message: "Category not found" });
      }
      response.json(category);
    } catch (error) {
      next(error);
    }
  },

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = createCategorySchema.parse(request.body);
      const category = await categoryService.createCategory(payload);
      response.status(201).json(category);
    } catch (error) {
      next(error);
    }
  },

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const payload = updateCategorySchema.parse(request.body);
      const category = await categoryService.updateCategory(String(id), payload);
      response.json(category);
    } catch (error) {
      next(error);
    }
  },

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      await categoryService.deleteCategory(String(id));
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
