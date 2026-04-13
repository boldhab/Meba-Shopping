import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export const rateLimitMiddleware = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});
