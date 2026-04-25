import type { NextFunction, Request, Response } from "express";
import { couponService } from "../services/couponService";

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
};
