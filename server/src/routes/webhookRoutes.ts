import { Router } from "express";

export const webhookRouter = Router();

webhookRouter.post("/stripe", (_request, response) => {
  response.status(200).json({ received: true });
});
