import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";

export function errorMiddleware(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
    return;
  }

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      message: error.message,
      details: error.details ?? null
    });
    return;
  }

  logger.error("Unhandled server error", error instanceof Error ? error : undefined);

  response.status(500).json({
    message: "Internal server error."
  });
}
