import { Router } from "express";
import { paymentController } from "../../controllers/paymentController";

export const paymentRoutes = Router();

paymentRoutes.get("/", paymentController);
