import express from "express";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { loggingMiddleware } from "./middleware/loggingMiddleware";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";
import { securityMiddleware } from "./middleware/securityMiddleware";
import { apiV1Router } from "./routes/v1";
import { webhookRouter } from "./routes/webhookRoutes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(securityMiddleware);
  app.use(loggingMiddleware);
  app.use(rateLimitMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/v1", apiV1Router);
  app.use("/webhooks", webhookRouter);

  app.get("/api/v1/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "meba-api"
    });
  });

  app.use(errorMiddleware);

  return app;
}
