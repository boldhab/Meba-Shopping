import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Meba API running on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    logger.info("Shutting down API server.");
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch(async (error) => {
  logger.error("Failed to start API server.", error instanceof Error ? error : undefined);
  await disconnectDatabase();
  process.exit(1);
});
