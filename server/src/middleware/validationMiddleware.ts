import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateRequest(schema: ZodType) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      request.body = await schema.parseAsync(request.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
