import { inventoryWorker } from "./workers/inventoryWorker";
import { logger } from "../config/logger";
import { cacheStore } from "../config/redis";
import { inventoryService } from "../services/inventoryService";

export interface InventoryJob {
  type: "cleanup_expired" | "release_order" | "deduct_order";
  orderId?: string;
  createdAt?: string;
}

const QUEUE_KEY = "queue:inventory";
let intervalHandle: NodeJS.Timeout | null = null;
let workerRunning = false;

export const inventoryQueue = {
  name: "inventory",

  /**
   * Enqueue an inventory task for distributed background processing.
   */
  async addJob(job: InventoryJob): Promise<number> {
    const payload = JSON.stringify({
      ...job,
      createdAt: job.createdAt || new Date().toISOString(),
    });
    return await cacheStore.rpush(QUEUE_KEY, payload);
  },

  /**
   * Process a single queued inventory job.
   */
  async processNextJob(): Promise<boolean> {
    const rawJob = await cacheStore.lpop(QUEUE_KEY);
    if (!rawJob) return false;

    try {
      const job: InventoryJob = JSON.parse(rawJob);
      if (job.type === "cleanup_expired") {
        await inventoryWorker();
      } else if (job.type === "release_order" && job.orderId) {
        await inventoryService.releaseStockForOrder(job.orderId);
      } else if (job.type === "deduct_order" && job.orderId) {
        await inventoryService.deductStockForOrder(job.orderId);
      }
      return true;
    } catch (err) {
      logger.error("[InventoryQueue] Error processing inventory job:", err instanceof Error ? err : undefined);
      return false;
    }
  },

  /**
   * Process all currently pending jobs in the queue.
   */
  async drainQueue(): Promise<number> {
    let processed = 0;
    while (await this.processNextJob()) {
      processed++;
    }
    return processed;
  },

  /**
   * Start recurring cleanup timer and worker drain.
   */
  startCleanupScheduler(intervalMs = 5 * 60 * 1000) {
    if (intervalHandle) return;

    logger.info(`[InventoryScheduler] Started inventory cleanup scheduler (interval: ${intervalMs / 1000}s)`);

    const runWorkerCycle = async () => {
      if (workerRunning) return;
      workerRunning = true;
      try {
        await this.drainQueue();
        await inventoryWorker().catch(() => {});
      } finally {
        workerRunning = false;
      }
    };

    // Initial pass
    void runWorkerCycle();

    intervalHandle = setInterval(() => {
      void runWorkerCycle();
    }, intervalMs);
    if (intervalHandle.unref) {
      intervalHandle.unref();
    }
  },

  stopCleanupScheduler() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
      logger.info("[InventoryScheduler] Stopped inventory cleanup scheduler");
    }
  }
};
