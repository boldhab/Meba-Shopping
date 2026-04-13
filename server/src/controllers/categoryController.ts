import type { Request, Response } from "express";

export function categoryController(_request: Request, response: Response) {
  response.json({ resource: "categories" });
}
