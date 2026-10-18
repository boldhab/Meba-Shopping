import { mailer } from "../../config/mailer";
import { logger } from "../../config/logger";

export interface EmailJob {
  type: "order_confirmation" | "payment_failed" | "low_stock" | "custom";
  to: string;
  subject: string;
  text?: string;
  html?: string;
  orderId?: string;
}

export async function emailWorker(job?: EmailJob): Promise<boolean> {
  if (!job) return true;

  try {
    await mailer.sendEmail({
      to: job.to,
      subject: job.subject,
      text: job.text || "",
      html: job.html || `<p>${job.text || ""}</p>`,
    });
    logger.info(`[EmailWorker] Dispatched email '${job.subject}' to ${job.to}`);
    return true;
  } catch (error) {
    logger.error(`[EmailWorker] Failed to dispatch email to ${job?.to}:`, error instanceof Error ? error : undefined);
    return false;
  }
}
