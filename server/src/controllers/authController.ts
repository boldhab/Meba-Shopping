import type { Request, Response } from "express";

export function authController(_request: Request, response: Response) {
  response.json({ resource: "auth" });
}
