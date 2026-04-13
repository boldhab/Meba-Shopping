import type { Request, Response } from "express";

export function paymentController(_request: Request, response: Response) {
  response.json({ resource: "payments" });
}
