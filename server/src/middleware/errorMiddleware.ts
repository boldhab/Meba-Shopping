import type { NextFunction, Request, Response } from "express";

export function errorMiddleware(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  response.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
}
