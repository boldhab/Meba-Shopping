import type { Request, Response } from "express";

export function adminController(_request: Request, response: Response) {
  response.json({ resource: "admin" });
}
