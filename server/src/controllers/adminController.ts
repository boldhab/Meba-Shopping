import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { productService } from "../services/productService";
import { ApiError } from "../utils/apiError";

const updateDealSchema = z
  .object({
    dealType: z.enum(["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"]).nullable().optional(),
    isDealActive: z.boolean().optional(),
    dealStartAt: z.string().datetime().nullable().optional(),
    dealEndAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (payload) => {
      if (!payload.dealStartAt || !payload.dealEndAt) {
        return true;
      }

      return new Date(payload.dealStartAt).getTime() <= new Date(payload.dealEndAt).getTime();
    },
    {
      message: "dealStartAt must be before or equal to dealEndAt.",
      path: ["dealStartAt"],
    }
  );

export const adminController = {
  async overview(_request: Request, response: Response) {
    response.json({ resource: "admin" });
  },

  async listDeals(_request: Request, response: Response, next: NextFunction) {
    try {
      const result = await productService.listProductsForAdminDeals();
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateDeal(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = updateDealSchema.parse(request.body);
      const product = await productService.updateProductDeal(String(request.params.id), payload);

      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      response.json(product);
    } catch (error) {
      next(error);
    }
  },
};
