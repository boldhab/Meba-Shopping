import type { NextFunction, Request, Response } from "express";
import { productService } from "../services/productService";

export const productController = {
  async list(request: Request, response: Response, next: NextFunction) {
    try {
      const { categoryId, search, minPrice, maxPrice, dealType, dealsOnly, page, limit, sort } = request.query as any;
      const result = await productService.getAllProducts({
        categoryId,
        search,
        minPrice,
        maxPrice,
        dealType,
        dealsOnly,
        page,
        limit,
        sort,
      });
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listActiveDeals(request: Request, response: Response, next: NextFunction) {
    try {
      const { dealType, limit } = request.query as any;
      const result = await productService.getActiveDeals({ dealType, limit });
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(request: Request, response: Response, next: NextFunction) {
    try {
      const { slug } = request.params;
      const product = await productService.getProductBySlug(slug as string);
      if (!product) {
        return response.status(404).json({ message: "Product not found" });
      }
      response.json(product);
    } catch (error) {
      next(error);
    }
  },
};
