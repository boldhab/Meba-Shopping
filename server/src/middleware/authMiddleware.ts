import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/generateToken";
import { ApiError } from "../utils/apiError";

function extractToken(request: Request): string | null {
  const authorizationHeader = request.headers.authorization;
  if (authorizationHeader?.startsWith("Bearer ")) {
    return authorizationHeader.replace("Bearer ", "").trim();
  }

  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, decodeURIComponent(v.join("="))];
      })
    );
    if (cookies.token) {
      return cookies.token.trim();
    }
  }

  return null;
}

export function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  const token = extractToken(request);

  if (!token) {
    next(new ApiError(401, "Authorization token is missing."));
    return;
  }

  try {
    const payload = verifyToken(token);

    request.user = {
      id: payload.sub || (payload as any).userId || (payload as any).id,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    next(new ApiError(401, "Invalid or expired authorization token."));
  }
}

export function optionalAuthMiddleware(request: Request, _response: Response, next: NextFunction) {
  const token = extractToken(request);

  if (token) {
    try {
      const payload = verifyToken(token);
      request.user = {
        id: payload.sub || (payload as any).userId || (payload as any).id,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      // Ignore errors for optional auth
    }
  }

  next();
}
