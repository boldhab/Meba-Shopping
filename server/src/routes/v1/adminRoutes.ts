import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";

export const adminRoutes = Router();

adminRoutes.get("/", authMiddleware, adminMiddleware, adminController.overview);
adminRoutes.get("/products", authMiddleware, adminMiddleware, adminController.listProducts);
adminRoutes.get("/products/:id", authMiddleware, adminMiddleware, adminController.getProduct);
adminRoutes.post("/products", authMiddleware, adminMiddleware, adminController.createProduct);
adminRoutes.patch("/products/:id", authMiddleware, adminMiddleware, adminController.updateProduct);
adminRoutes.get("/deals", authMiddleware, adminMiddleware, adminController.listDeals);
adminRoutes.get("/orders", authMiddleware, adminMiddleware, adminController.listOrders);
adminRoutes.get("/orders/:id", authMiddleware, adminMiddleware, adminController.getOrder);
adminRoutes.patch("/orders/:id/status", authMiddleware, adminMiddleware, adminController.updateOrderStatus);
adminRoutes.get("/users", authMiddleware, adminMiddleware, adminController.listUsers);
adminRoutes.get("/users/:id", authMiddleware, adminMiddleware, adminController.getUser);
adminRoutes.patch("/deals/:id", authMiddleware, adminMiddleware, adminController.updateDeal);
