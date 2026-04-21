import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { logger } from "../config/logger";
import { ApiError } from "../utils/apiError";

export function errorMiddleware(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      response.status(400).json({
        message: "Image file is too large. Max size is 5MB."
      });
      return;
    }

    response.status(400).json({
      message: "Invalid upload payload."
    });
    return;
  }

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
