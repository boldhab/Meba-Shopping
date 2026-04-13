import type { Request, Response } from "express";

export function userController(_request: Request, response: Response) {
  response.json({ resource: "users" });
}
