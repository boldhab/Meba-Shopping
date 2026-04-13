import type { Request, Response } from "express";

export function analyticsController(_request: Request, response: Response) {
  response.json({ resource: "analytics" });
}
