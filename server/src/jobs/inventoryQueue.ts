import { inventoryWorker } from "./workers/inventoryWorker";
import { logger } from "../config/logger";

let intervalHandle: NodeJS.Timeout | null = null;

export const inventoryQueue = {
  name: "inventory",

  startCleanupScheduler(intervalMs = 5 * 60 * 1000) {
    if (intervalHandle) return;

    logger.info(`[InventoryScheduler] Started inventory cleanup scheduler (interval: ${intervalMs / 1000}s)`);
    // Run an initial pass
    void inventoryWorker().catch(() => {});

    intervalHandle = setInterval(() => {
      void inventoryWorker().catch(() => {});
    }, intervalMs);
  },

  stopCleanupScheduler() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
      logger.info("[InventoryScheduler] Stopped inventory cleanup scheduler");
    }
  }
};

