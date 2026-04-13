import type { NextFunction, Request, Response } from "express";

export function securityMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next();
}
