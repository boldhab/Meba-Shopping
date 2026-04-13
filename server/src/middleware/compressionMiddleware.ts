import type { NextFunction, Request, Response } from "express";

export function compressionMiddleware(_request: Request, _response: Response, next: NextFunction) {
  next();
}
