import type { Request, Response } from "express";

export function orderController(_request: Request, response: Response) {
  response.json({ resource: "orders" });
}
