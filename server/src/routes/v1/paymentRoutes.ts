import { Router } from "express";
import { paymentController } from "../../controllers/paymentController";

import { authMiddleware } from "../../middleware/authMiddleware";

export const paymentRoutes = Router();

paymentRoutes.post("/create-intent", authMiddleware, paymentController.createIntent);
