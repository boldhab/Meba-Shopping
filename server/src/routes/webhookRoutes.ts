import { Router } from "express";
import express from "express";
import { paymentService } from "../services/paymentService";
import { logger } from "../config/logger";

export const webhookRouter = Router();

// Stripe needs the raw body to validate signatures
webhookRouter.post("/stripe", express.raw({ type: "application/json" }), async (request, response) => {
  const signature = request.headers["stripe-signature"] as string;

  try {
    const result = await paymentService.handleWebhook(signature, request.body);
    response.status(200).json(result);
  } catch (error: any) {
    logger.error("Stripe webhook error:", error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Telebirr Mobile Money Webhook / IPN Notification
webhookRouter.post("/telebirr", express.json(), async (request, response) => {
  try {
    const signature = request.headers["x-telebirr-signature"] as string | undefined;
    const result = await paymentService.handleTelebirrWebhook(request.body, signature);
    response.status(200).json(result);
  } catch (error: any) {
    logger.error("Telebirr webhook error:", error.message);
    response.status(error.statusCode || 400).json({ code: 1, message: error.message });
  }
});

// Commercial Bank of Ethiopia (CBE Birr) Webhook Notification
webhookRouter.post("/cbebirr", express.json(), async (request, response) => {
  try {
    const signature = request.headers["x-cbe-signature"] as string | undefined;
    const result = await paymentService.handleCbeBirrWebhook(request.body, signature);
    response.status(200).json(result);
  } catch (error: any) {
    logger.error("CBE Birr webhook error:", error.message);
    response.status(error.statusCode || 400).json({ status: "ERROR", message: error.message });
  }
});
