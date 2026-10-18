import { Router } from "express";
import { paymentController } from "../../controllers/paymentController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const paymentRoutes = Router();

paymentRoutes.post("/create-intent", authMiddleware, paymentController.createIntent);
paymentRoutes.post("/mobile-intent", authMiddleware, paymentController.createMobileIntent);
paymentRoutes.get("/verify/:orderId", authMiddleware, paymentController.verifyPayment);
