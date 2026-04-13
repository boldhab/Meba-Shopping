import type { Request, Response } from "express";

export function reviewController(_request: Request, response: Response) {
  response.json({ resource: "reviews" });
}
