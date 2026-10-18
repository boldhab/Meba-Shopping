import type { NextFunction, Request, Response } from "express";
import { cacheStore } from "../config/redis";
import { logger } from "../config/logger";

export interface CacheOptions {
  ttlSeconds?: number;
  prefix?: string;
}

/**
 * Cache middleware for Express GET endpoints.
 * Returns cached responses with X-Cache: HIT, or computes and caches with X-Cache: MISS.
 */
export function cacheMiddleware(options?: CacheOptions) {
  const ttlSeconds = options?.ttlSeconds ?? 120;
  const prefix = options?.prefix ?? "catalog";

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache safe GET requests
    if (req.method !== "GET") {
      return next();
    }

    const cacheKey = `${prefix}:${req.originalUrl || req.url}`;

    try {
      const cached = await cacheStore.get(cacheKey);
      if (cached) {
        res.setHeader("X-Cache", "HIT");
        res.setHeader("Content-Type", "application/json");
        return res.status(200).send(cached);
      }

      res.setHeader("X-Cache", "MISS");

      // Hook into response completion to capture and cache the payload
      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const serialized = JSON.stringify(body);
          void cacheStore.set(cacheKey, serialized, ttlSeconds).catch((err) => {
            logger.warn(`[CacheMiddleware] Failed to set cache for ${cacheKey}:`, err instanceof Error ? err : undefined);
          });
        }
        return originalJson(body);
      };

      res.send = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && typeof body === "string") {
          void cacheStore.set(cacheKey, body, ttlSeconds).catch((err) => {
            logger.warn(`[CacheMiddleware] Failed to set cache for ${cacheKey}:`, err instanceof Error ? err : undefined);
          });
        }
        return originalSend(body);
      };

      next();
    } catch (err) {
      logger.warn(`[CacheMiddleware] Error in cache check for ${cacheKey}:`, err instanceof Error ? err : undefined);
      next();
    }
  };
}

/**
 * Programmatic cache invalidation by patterns (e.g. "catalog:*", "catalog:/api/v1/products*")
 */
export async function invalidateCache(...patterns: string[]): Promise<void> {
  try {
    for (const pattern of patterns) {
      await cacheStore.delByPattern(pattern);
    }
  } catch (err) {
    logger.warn(`[CacheMiddleware] Cache invalidation error:`, err instanceof Error ? err : undefined);
  }
}

/**
 * Express middleware to trigger cache invalidation upon successful mutation (POST, PATCH, DELETE, PUT)
 */
export function invalidateCacheMiddleware(patterns: string[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const triggerInvalidation = () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void invalidateCache(...patterns);
      }
    };

    res.json = (body: any) => {
      triggerInvalidation();
      return originalJson(body);
    };

    res.send = (body: any) => {
      triggerInvalidation();
      return originalSend(body);
    };

    next();
  };
}
