import morgan from "morgan";
import { logger } from "../config/logger";

export const loggingMiddleware = morgan("combined", {
  stream: {
    write(message: string) {
      logger.info(message.trim());
    }
  }
});
