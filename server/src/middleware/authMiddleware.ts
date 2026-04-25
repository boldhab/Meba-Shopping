import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/generateToken";
import { ApiError } from "../utils/apiError";

export function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new ApiError(401, "Authorization token is missing."));
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyToken(token);

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired authorization token."));
  }
}
export function optionalAuthMiddleware(request: Request, _response: Response, next: NextFunction) {
  const authorizationHeader = request.headers.authorization;

  if (authorizationHeader?.startsWith("Bearer ")) {
    const token = authorizationHeader.replace("Bearer ", "").trim();
    try {
      const payload = verifyToken(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role
      };
    } catch {
      // Ignore errors for optional auth
    }
  }

  next();
}
