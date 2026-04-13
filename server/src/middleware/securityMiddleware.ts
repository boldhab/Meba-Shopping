import cors from "cors";
import helmet from "helmet";
import { env } from "../config/env";

export const securityMiddleware = [
  helmet(),
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
];
