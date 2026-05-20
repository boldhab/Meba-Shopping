import { Router } from "express";
import { orderController } from "../../controllers/orderController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const orderRoutes = Router();

orderRoutes.post("/", authMiddleware, orderController.createOrder);
orderRoutes.get("/", authMiddleware, orderController.listOrders);
orderRoutes.get("/:id", authMiddleware, orderController.getOrder);
