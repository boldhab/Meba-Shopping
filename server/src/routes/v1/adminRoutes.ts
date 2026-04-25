import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";
import { productImageUpload } from "../../middleware/uploadMiddleware";

export const adminRoutes = Router();

adminRoutes.get("/", authMiddleware, adminMiddleware, adminController.overview);
adminRoutes.get("/products", authMiddleware, adminMiddleware, adminController.listProducts);
adminRoutes.get("/products/:id", authMiddleware, adminMiddleware, adminController.getProduct);
adminRoutes.post("/products", authMiddleware, adminMiddleware, productImageUpload, adminController.createProduct);
adminRoutes.patch("/products/:id", authMiddleware, adminMiddleware, productImageUpload, adminController.updateProduct);
adminRoutes.delete("/products/:id", authMiddleware, adminMiddleware, adminController.deleteProduct);
adminRoutes.get("/products/export", authMiddleware, adminMiddleware, adminController.exportProducts);
adminRoutes.post("/products/import", authMiddleware, adminMiddleware, productImageUpload, adminController.importProducts);
adminRoutes.get("/deals", authMiddleware, adminMiddleware, adminController.listDeals);
adminRoutes.get("/orders", authMiddleware, adminMiddleware, adminController.listOrders);
adminRoutes.get("/orders/:id", authMiddleware, adminMiddleware, adminController.getOrder);
adminRoutes.patch("/orders/:id/status", authMiddleware, adminMiddleware, adminController.updateOrderStatus);
adminRoutes.get("/users", authMiddleware, adminMiddleware, adminController.listUsers);
adminRoutes.get("/users/:id", authMiddleware, adminMiddleware, adminController.getUser);
adminRoutes.patch("/deals/:id", authMiddleware, adminMiddleware, adminController.updateDeal);
adminRoutes.patch("/reviews/:id/status", authMiddleware, adminMiddleware, adminController.updateReviewStatus);
adminRoutes.delete("/reviews/:id", authMiddleware, adminMiddleware, adminController.deleteReview);
adminRoutes.get("/cart/overview", authMiddleware, adminMiddleware, adminController.cartOverview);
adminRoutes.get("/cart/abandoned", authMiddleware, adminMiddleware, adminController.listAbandonedCarts);
adminRoutes.get("/cart/rules", authMiddleware, adminMiddleware, adminController.getCartRules);
adminRoutes.put("/cart/rules", authMiddleware, adminMiddleware, adminController.updateCartRules);
