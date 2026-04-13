import type { NextFunction, Request, Response } from "express";

export function loggingMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next();
}
