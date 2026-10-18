import { cacheStore } from "../config/redis";
import { logger } from "../config/logger";
import { emailWorker, type EmailJob } from "./workers/emailWorker";

const EMAIL_QUEUE_KEY = "queue:email";
let intervalHandle: NodeJS.Timeout | null = null;
let isProcessing = false;

export const emailQueue = {
  name: "email",

  /**
   * Enqueue an email job for background asynchronous delivery
   */
  async addJob(job: EmailJob): Promise<number> {
    const raw = JSON.stringify(job);
    return await cacheStore.rpush(EMAIL_QUEUE_KEY, raw);
  },

  /**
   * Process a single queued email job
   */
  async processNextJob(): Promise<boolean> {
    const raw = await cacheStore.lpop(EMAIL_QUEUE_KEY);
    if (!raw) return false;

    try {
      const job: EmailJob = JSON.parse(raw);
      return await emailWorker(job);
    } catch (err) {
      logger.error("[EmailQueue] Error processing queued email job:", err instanceof Error ? err : undefined);
      return false;
    }
  },

  /**
   * Drain and execute all pending email jobs
   */
  async drainQueue(): Promise<number> {
    let processed = 0;
    while (await this.processNextJob()) {
      processed++;
    }
    return processed;
  },

  /**
   * Helper to enqueue order confirmation email
   */
  async enqueueOrderConfirmation(order: any, userEmail: string): Promise<number> {
    return await this.addJob({
      type: "order_confirmation",
      to: userEmail,
      subject: `Order Confirmation - ${order.id.slice(0, 8).toUpperCase()}`,
      orderId: order.id,
      text: `Thank you for your order! Your order ID is ${order.id}. Total amount: ${order.totalAmount} ETB.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #0f172a;">Thank you for shopping at Meba Supermarket!</h2>
          <p>Your order has been recorded successfully and is being prepared.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Total Amount:</strong> ${order.totalAmount} ETB</p>
            <p><strong>Status:</strong> ${order.status || "CONFIRMED"}</p>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you have any questions, reply directly to this email or visit our Help Center.</p>
        </div>
      `,
    });
  },

  /**
   * Helper to enqueue payment failed alert email
   */
  async enqueuePaymentFailed(order: any, userEmail: string): Promise<number> {
    return await this.addJob({
      type: "payment_failed",
      to: userEmail,
      subject: `Action Required: Payment Failed for Order ${order.id.slice(0, 8).toUpperCase()}`,
      orderId: order.id,
      text: `We were unable to process payment for your order ${order.id}. Please update your payment method.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #fee2e2; rounded: 12px;">
          <h2 style="color: #991b1b;">Payment Failed</h2>
          <p>We were unable to process the transaction for your order <strong>${order.id}</strong>.</p>
          <p>Please log in to your Meba account to choose an alternative payment method.</p>
        </div>
      `,
    });
  },

  /**
   * Helper to enqueue low stock alerts to store administrators
   */
  async enqueueLowStock(product: any, admins: string[]): Promise<number> {
    let count = 0;
    for (const adminEmail of admins) {
      await this.addJob({
        type: "low_stock",
        to: adminEmail,
        subject: `⚠️ Low Stock Alert: ${product.name}`,
        text: `Product ${product.name} (ID: ${product.id}) is running low on stock. Remaining count: ${product.stock}.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
            <h2 style="color: #b45309;">Low Inventory Alert</h2>
            <p>The inventory level for <strong>${product.name}</strong> has dropped below threshold.</p>
            <p><strong>Current Units:</strong> ${product.stock}</p>
          </div>
        `,
      });
      count++;
    }
    return count;
  },

  /**
   * Start asynchronous worker consumer loop
   */
  startWorker(pollIntervalMs = 2500) {
    if (intervalHandle) return;

    logger.info(`[EmailQueue] Started email worker consumer (interval: ${pollIntervalMs}ms)`);

    intervalHandle = setInterval(async () => {
      if (isProcessing) return;
      isProcessing = true;
      try {
        await this.drainQueue();
      } finally {
        isProcessing = false;
      }
    }, pollIntervalMs);

    if (intervalHandle.unref) {
      intervalHandle.unref();
    }
  },

  /**
   * Stop email worker consumer loop
   */
  stopWorker() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
      logger.info("[EmailQueue] Stopped email worker consumer");
    }
  }
};
export type { EmailJob };
