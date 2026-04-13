import type { NextFunction, Request, Response } from "express";

export function adminMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next();
}
