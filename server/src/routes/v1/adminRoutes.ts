import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";

export const adminRoutes = Router();

adminRoutes.get("/", authMiddleware, adminMiddleware, adminController.overview);
adminRoutes.get("/deals", authMiddleware, adminMiddleware, adminController.listDeals);
adminRoutes.get("/orders", authMiddleware, adminMiddleware, adminController.listOrders);
adminRoutes.get("/orders/:id", authMiddleware, adminMiddleware, adminController.getOrder);
adminRoutes.get("/users", authMiddleware, adminMiddleware, adminController.listUsers);
adminRoutes.get("/users/:id", authMiddleware, adminMiddleware, adminController.getUser);
adminRoutes.patch("/deals/:id", authMiddleware, adminMiddleware, adminController.updateDeal);
