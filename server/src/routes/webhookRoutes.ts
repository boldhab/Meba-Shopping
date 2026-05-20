import { Router } from "express";
import express from "express";
import { paymentService } from "../services/paymentService";

export const webhookRouter = Router();

// Stripe needs the raw body to validate signatures
webhookRouter.post("/stripe", express.raw({ type: "application/json" }), async (request, response) => {
  const signature = request.headers["stripe-signature"] as string;

  try {
    const result = await paymentService.handleWebhook(signature, request.body);
    response.status(200).json(result);
  } catch (error: any) {
    console.error("Stripe webhook error:", error.message);
    response.status(400).send(`Webhook Error: ${error.message}`);
  }
});
