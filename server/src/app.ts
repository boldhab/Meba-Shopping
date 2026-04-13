import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { apiV1Router } from "./routes/v1";
import { webhookRouter } from "./routes/webhookRoutes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl
    })
  );
  app.use(express.json());
  app.use("/api/v1", apiV1Router);
  app.use("/webhooks", webhookRouter);

  app.get("/api/v1/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "meba-api"
    });
  });

  return app;
}
