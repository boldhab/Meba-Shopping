import { inventoryQueue } from "../../../jobs/inventoryQueue";
import { emailQueue } from "../../../jobs/emailQueue";
import { cacheStore } from "../../../config/redis";

describe("Distributed Queues (Inventory & Email)", () => {
  beforeEach(async () => {
    await cacheStore.flushAll();
  });

  afterAll(async () => {
    inventoryQueue.stopCleanupScheduler();
    emailQueue.stopWorker();
    await cacheStore.flushAll();
    await cacheStore.disconnect();
  });

  it("should enqueue and process inventory background tasks", async () => {
    const queueLen1 = await inventoryQueue.addJob({ type: "cleanup_expired" });
    expect(queueLen1).toBe(1);

    const queueLen2 = await inventoryQueue.addJob({ type: "release_order", orderId: "non-existent-order" });
    expect(queueLen2).toBe(2);

    const processed = await inventoryQueue.drainQueue();
    expect(processed).toBe(2);

    const remaining = await cacheStore.llen("queue:inventory");
    expect(remaining).toBe(0);
  });

  it("should enqueue and drain email jobs", async () => {
    const len1 = await emailQueue.enqueueOrderConfirmation(
      { id: "test_order_queue", totalAmount: 500, status: "PAID" },
      "customer@test.com"
    );
    expect(len1).toBe(1);

    const len2 = await emailQueue.enqueuePaymentFailed(
      { id: "test_order_queue" },
      "customer@test.com"
    );
    expect(len2).toBe(2);

    const processed = await emailQueue.drainQueue();
    expect(processed).toBe(2);

    const remaining = await cacheStore.llen("queue:email");
    expect(remaining).toBe(0);
  });
});
