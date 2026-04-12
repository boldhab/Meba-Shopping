import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["PORT", "CLIENT_URL", "DATABASE_URL", "JWT_SECRET"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT),
  clientUrl: process.env.CLIENT_URL as string,
  databaseUrl: process.env.DATABASE_URL as string,
  jwtSecret: process.env.JWT_SECRET as string,
  nodeEnv: process.env.NODE_ENV ?? "development"
};

