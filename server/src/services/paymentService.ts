import Stripe from "stripe";
import { stripe as stripeConfig } from "../config/stripe";
import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import { emailService } from "./emailService";
import { inventoryService } from "./inventoryService";

const stripeClient = new Stripe(stripeConfig.secretKey || "sk_test_mock", {
  apiVersion: "2024-06-20" as any,
});

export const paymentService = {
  async createPaymentIntent(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) throw new ApiError(404, "Order not found");
    if (order.userId !== userId) throw new ApiError(403, "You do not have permission to pay for this order");
    if (order.paymentStatus === "PAID") throw new ApiError(400, "Order is already paid");

    const amountInCents = Math.round(order.totalAmount.toNumber() * 100);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: order.userId
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentId: paymentIntent.id }
    });

    return { clientSecret: paymentIntent.client_secret };
  },

  async handleWebhook(signature: string, body: string | Buffer) {
    let event: Stripe.Event;
    
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

    try {
      if (endpointSecret) {
        event = stripeClient.webhooks.constructEvent(body, signature, endpointSecret);
      } else {
        event = JSON.parse(body.toString()) as Stripe.Event;
      }
    } catch (err: any) {
      throw new ApiError(400, `Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

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
          console.warn("Error finalizing stock reservations:", e);
        }

        await emailService.sendOrderConfirmation(order, order.user.email);
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED" },
          include: { user: true }
        });
        
        await emailService.sendPaymentFailed(order, order.user.email);
      }
    }

    return { received: true };
  }
};
