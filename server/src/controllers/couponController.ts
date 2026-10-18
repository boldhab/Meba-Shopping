import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { couponService } from "../services/couponService";

const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discountPercent: z.number().int().min(1).max(100),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

const updateCouponSchema = z.object({
  code: z.string().min(1).optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const couponController = {
  async validate(request: Request, response: Response, next: NextFunction) {
    try {
      const code = typeof request.query.code === "string" ? request.query.code : "";
      const result = await couponService.validateCoupon(code);
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async list(_request: Request, response: Response, next: NextFunction) {
    try {
      const coupons = await couponService.listCoupons();
      response.json(coupons);
    } catch (error) {
      next(error);
    }
  },

  async create(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = createCouponSchema.parse(request.body);
      const coupon = await couponService.createCoupon(payload);
      response.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  },

  async update(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const payload = updateCouponSchema.parse(request.body);
      const coupon = await couponService.updateCoupon(String(id), payload);
      response.json(coupon);
    } catch (error) {
      next(error);
    }
  },

  async delete(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      await couponService.deleteCoupon(String(id));
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
