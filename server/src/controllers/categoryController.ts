import type { NextFunction, Request, Response } from "express";
import { categoryService } from "../services/categoryService";

export const categoryController = {
  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const result = await categoryService.getAllCategories();
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
};
