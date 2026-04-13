import { Router } from "express";
import { orderController } from "../../controllers/orderController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const orderRoutes = Router();

orderRoutes.get("/", authMiddleware, orderController);
