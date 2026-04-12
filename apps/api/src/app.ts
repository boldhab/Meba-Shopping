import cors from "cors";
import express from "express";
import { env } from "./config/env";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl
    })
  );
  app.use(express.json());

  app.get("/api/v1/health", (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "meba-api"
    });
  });

  return app;
}

