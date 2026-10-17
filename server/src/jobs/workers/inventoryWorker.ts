import { inventoryService } from "../../services/inventoryService";
import { logger } from "../../config/logger";

export async function inventoryWorker() {
  try {
    const result = await inventoryService.releaseExpiredReservations();
    if (result.releasedCount > 0 || result.cancelledOrdersCount > 0) {
      logger.info(
        `[InventoryWorker] Expired reservations cleanup: ${result.releasedCount} stock units released, ${result.cancelledOrdersCount} orders cancelled.`
      );
    }
    return result;
  } catch (error) {
    logger.error("[InventoryWorker] Failed to run expired reservations cleanup", error instanceof Error ? error : undefined);
    throw error;
  }
}

