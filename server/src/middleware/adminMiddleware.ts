import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export function adminMiddleware(request: Request, _response: Response, next: NextFunction) {
  if (request.user?.role !== "ADMIN") {
    next(new ApiError(403, "Admin access is required."));
    return;
  }

  next();
}
