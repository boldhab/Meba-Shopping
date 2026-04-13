import type { Request, Response } from "express";

export function couponController(_request: Request, response: Response) {
  response.json({ resource: "coupons" });
}
