import Stripe from "stripe";
import { stripe as stripeConfig } from "../config/stripe";
import { env } from "../config/env";
import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import { emailService } from "./emailService";
import { inventoryService } from "./inventoryService";
import { logger } from "../config/logger";

const stripeClient = new Stripe(env.stripeSecretKey || stripeConfig.secretKey || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});

export interface MobilePaymentIntentResponse {
  orderId: string;
  provider: "telebirr" | "cbebirr";
  mobileNumber?: string;
  amount: number;
  currency: string;
  referenceCode: string;
  merchantCode: string;
  merchantName: string;
  ussdPrompt: string;
  qrUrl?: string;
  expiresInSeconds: number;
  instructions: string;
}

export const paymentService = {
  async createPaymentIntent(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) throw new ApiError(404, "Order not found");
    if (order.userId !== userId) throw new ApiError(403, "You do not have permission to pay for this order");
    if (order.paymentStatus === "PAID") throw new ApiError(400, "Order is already paid");

    const total = order.totalAmount.toNumber();
    let amountInCents: number;

    // Currency normalization: If platform currency is ETB and Stripe charges in USD, convert using exchange rate
    if (env.platformCurrency.toUpperCase() === "ETB" && env.stripeCurrency.toLowerCase() === "usd") {
      const amountInUsd = total * env.etbToUsdExchangeRate;
      amountInCents = Math.max(50, Math.round(amountInUsd * 100)); // Stripe minimum 50 cents USD
    } else {
      amountInCents = Math.round(total * 100);
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: env.stripeCurrency.toLowerCase(),
      metadata: {
        orderId: order.id,
        userId: order.userId,
        originalAmount: total.toString(),
        originalCurrency: env.platformCurrency,
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentId: paymentIntent.id,
        paymentMethod: "CARD",
      }
    });

    return { clientSecret: paymentIntent.client_secret };
  },

  /**
   * Initiate Mobile Money payment for Telebirr or CBE Birr
   */
  async createMobileMoneyPayment(
    orderId: string,
    userId: string,
    provider: "telebirr" | "cbebirr",
    mobileNumber?: string
  ): Promise<MobilePaymentIntentResponse> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) throw new ApiError(404, "Order not found");
    if (order.userId !== userId) throw new ApiError(403, "You do not have permission to pay for this order");
    if (order.paymentStatus === "PAID") throw new ApiError(400, "Order is already paid");

    const amount = order.totalAmount.toNumber();
    const referenceCode = order.id.slice(0, 8).toUpperCase();

    let merchantCode = "";
    let ussdPrompt = "";
    let instructions = "";
    let qrUrl = "";

    if (provider === "telebirr") {
      merchantCode = "889922";
      ussdPrompt = `*127*1*${merchantCode}*${amount}*${referenceCode}#`;
      qrUrl = `https://telebirr.et/pay?shortCode=${merchantCode}&ref=${referenceCode}&amount=${amount}`;
      instructions = `Please open your Telebirr App or dial ${ussdPrompt} to complete your payment of ${amount} ETB.`;
    } else {
      merchantCode = "100029384756";
      ussdPrompt = `*847# -> 4 (Pay Bill) -> Merchant 889900 -> Ref: ${referenceCode}`;
      qrUrl = `https://cbebirr.cbe.com.et/pay?billNo=889900&ref=${referenceCode}&amount=${amount}`;
      instructions = `Dial *847# on your phone or use CBE Mobile Banking. Choose Pay Bill, enter code 889900 and reference ${referenceCode}.`;
    }

    // Persist payment intent on order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: provider.toUpperCase(),
        paymentReference: referenceCode,
      }
    });

    return {
      orderId: order.id,
      provider,
      mobileNumber,
      amount,
      currency: "ETB",
      referenceCode,
      merchantCode,
      merchantName: "Meba Supermarket PLC",
      ussdPrompt,
      qrUrl,
      expiresInSeconds: 900, // 15 minutes
      instructions,
    };
  },

  /**
   * Handle Telebirr IPN / Webhook Callback
   */
  async handleTelebirrWebhook(payload: any, _signature?: string) {
    logger.info("[TelebirrWebhook] Received callback payload:", payload);

    const body = typeof payload === "string" ? JSON.parse(payload) : payload;
    const orderId = body.orderId || body.outTradeNo || body.out_trade_no;
    const refCode = body.referenceCode || body.refCode;
    const status = (body.status || body.tradeStatus || "SUCCESS").toUpperCase();
    const transactionNo = body.transactionNo || body.msisdnTransactionId || `TB-TX-${Date.now()}`;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: String(orderId) }] : []),
          ...(refCode ? [{ paymentReference: String(refCode) }] : []),
          ...(orderId ? [{ paymentReference: String(orderId).slice(0, 8).toUpperCase() }] : [])
        ]
      },
      include: { user: true }
    });

    if (!order) {
      throw new ApiError(404, `Order not found for Telebirr notification (orderId: ${orderId}, ref: ${refCode})`);
    }

    if (status === "SUCCESS" || status === "PAID" || status === "COMPLETED") {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
          paymentReference: transactionNo,
        },
        include: { user: true }
      });

      // Deduct inventory
      try {
        await inventoryService.deductStockForOrder(order.id);
      } catch (e) {
        logger.warn("[TelebirrWebhook] Error finalizing stock reservations:", e instanceof Error ? e : undefined);
      }

      await emailService.sendOrderConfirmation(updatedOrder, updatedOrder.user.email);
      return { code: 0, message: "success", orderId: order.id };
    } else {
      const failedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
        include: { user: true }
      });

      // Release reserved stock back to available inventory
      try {
        await inventoryService.releaseStockForOrder(order.id);
      } catch (e) {
        logger.warn("[TelebirrWebhook] Error releasing stock reservations:", e instanceof Error ? e : undefined);
      }

      await emailService.sendPaymentFailed(failedOrder, failedOrder.user.email);
      return { code: 1, message: "payment marked failed", orderId: order.id };
    }
  },

  /**
   * Handle CBE Birr / Commercial Bank of Ethiopia Webhook Callback
   */
  async handleCbeBirrWebhook(payload: any, _signature?: string) {
    logger.info("[CbeBirrWebhook] Received callback payload:", payload);

    const body = typeof payload === "string" ? JSON.parse(payload) : payload;
    const orderId = body.orderId || body.billReference || body.reference;
    const status = (body.status || body.transactionStatus || "SUCCESS").toUpperCase();
    const cbeTxId = body.cbeTransactionId || body.txId || `CBE-TX-${Date.now()}`;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ id: String(orderId) }] : []),
          ...(orderId ? [{ paymentReference: String(orderId).slice(0, 8).toUpperCase() }] : []),
          ...(orderId ? [{ paymentReference: String(orderId) }] : [])
        ]
      },
      include: { user: true }
    });

    if (!order) {
      throw new ApiError(404, `Order not found for CBE Birr notification (ref: ${orderId})`);
    }

    if (status === "SUCCESS" || status === "COMPLETED" || status === "PAID") {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "PAID",
          paymentReference: cbeTxId,
        },
        include: { user: true }
      });

      try {
        await inventoryService.deductStockForOrder(order.id);
      } catch (e) {
        logger.warn("[CbeBirrWebhook] Error finalizing stock reservations:", e instanceof Error ? e : undefined);
      }

      await emailService.sendOrderConfirmation(updatedOrder, updatedOrder.user.email);
      return { status: "SUCCESS", message: "CBE Birr payment confirmed", orderId: order.id };
    } else {
      const failedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
        include: { user: true }
      });

      try {
        await inventoryService.releaseStockForOrder(order.id);
      } catch (e) {
        logger.warn("[CbeBirrWebhook] Error releasing stock reservations:", e instanceof Error ? e : undefined);
      }

      await emailService.sendPaymentFailed(failedOrder, failedOrder.user.email);
      return { status: "FAILED", message: "CBE Birr payment declined", orderId: order.id };
    }
  },

  /**
   * Check order payment verification status
   */
  async verifyPayment(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        paymentReference: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!order) throw new ApiError(404, "Order not found");
    if (order.userId !== userId) throw new ApiError(403, "Unauthorized");

    return {
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      totalAmount: order.totalAmount,
      isPaid: order.paymentStatus === "PAID",
    };
  },

  async handleWebhook(signature: string, body: string | Buffer) {
    let event: any;
    const endpointSecret = env.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET;

    if (!endpointSecret) {
      throw new ApiError(500, "Stripe webhook secret is not configured on the server.");
    }

    if (!signature) {
      throw new ApiError(400, "Missing Stripe signature header.");
    }

    try {
      event = stripeClient.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err: any) {
      throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", status: "PAID" },
          include: { user: true }
        });

        // Finalize stock reservations for this order (reservations were created at checkout)
        try {
          await inventoryService.deductStockForOrder(orderId);
        } catch (e) {
          logger.warn("Error finalizing stock reservations:", e instanceof Error ? e : undefined);
        }

        await emailService.sendOrderConfirmation(order, order.user.email);
      }
    } else if (event.type === "payment_intent.payment_failed" || event.type === "payment_intent.canceled") {
      const paymentIntent = event.data.object as any;
      const orderId = paymentIntent.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
          include: { user: true }
        });

        // Release stock reservations back to inventory on failure/cancellation
        try {
          await inventoryService.releaseStockForOrder(orderId);
        } catch (e) {
          logger.warn("Error releasing stock reservations for failed/canceled order:", e instanceof Error ? e : undefined);
        }
        
        await emailService.sendPaymentFailed(order, order.user.email);
      }
    }

    return { received: true };
  },

  async refundPayment(paymentIntentId: string, amountInCents?: number) {
    try {
      const refund = await stripeClient.refunds.create({
        payment_intent: paymentIntentId,
        ...(amountInCents ? { amount: amountInCents } : {}),
      });
      return refund;
    } catch (err: any) {
      throw new ApiError(500, `Stripe refund failed: ${err.message}`);
    }
  }
};
