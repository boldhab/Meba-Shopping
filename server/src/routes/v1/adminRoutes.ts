import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";
import { productImageUpload, csvFileUpload } from "../../middleware/uploadMiddleware";
import { invalidateCacheMiddleware } from "../../middleware/cacheMiddleware";

import { categoryController } from "../../controllers/categoryController";
import { couponController } from "../../controllers/couponController";

export const adminRoutes = Router();

const invalidateProductCache = invalidateCacheMiddleware(["catalog:products*"]);
const invalidateCategoryAndProductCache = invalidateCacheMiddleware(["catalog:categories*", "catalog:products*"]);

adminRoutes.get("/", authMiddleware, adminMiddleware, adminController.overview);
adminRoutes.get("/products", authMiddleware, adminMiddleware, adminController.listProducts);
adminRoutes.get("/products/:id", authMiddleware, adminMiddleware, adminController.getProduct);
adminRoutes.post("/products", authMiddleware, adminMiddleware, productImageUpload, invalidateProductCache, adminController.createProduct);
adminRoutes.patch("/products/:id", authMiddleware, adminMiddleware, productImageUpload, invalidateProductCache, adminController.updateProduct);
adminRoutes.delete("/products/:id", authMiddleware, adminMiddleware, invalidateProductCache, adminController.deleteProduct);
adminRoutes.get("/products/export", authMiddleware, adminMiddleware, adminController.exportProducts);
adminRoutes.post("/products/import", authMiddleware, adminMiddleware, csvFileUpload, invalidateProductCache, adminController.importProducts);
adminRoutes.get("/deals", authMiddleware, adminMiddleware, adminController.listDeals);
adminRoutes.get("/orders", authMiddleware, adminMiddleware, adminController.listOrders);
adminRoutes.get("/orders/:id", authMiddleware, adminMiddleware, adminController.getOrder);
adminRoutes.patch("/orders/:id/status", authMiddleware, adminMiddleware, adminController.updateOrderStatus);
adminRoutes.get("/users", authMiddleware, adminMiddleware, adminController.listUsers);
adminRoutes.get("/users/:id", authMiddleware, adminMiddleware, adminController.getUser);
adminRoutes.patch("/deals/:id", authMiddleware, adminMiddleware, invalidateProductCache, adminController.updateDeal);
adminRoutes.get("/reviews", authMiddleware, adminMiddleware, adminController.listReviews);
adminRoutes.patch("/reviews/:id/status", authMiddleware, adminMiddleware, adminController.updateReviewStatus);
adminRoutes.delete("/reviews/:id", authMiddleware, adminMiddleware, adminController.deleteReview);
adminRoutes.get("/cart/overview", authMiddleware, adminMiddleware, adminController.cartOverview);
adminRoutes.get("/cart/abandoned", authMiddleware, adminMiddleware, adminController.listAbandonedCarts);
adminRoutes.get("/cart/rules", authMiddleware, adminMiddleware, adminController.getCartRules);
adminRoutes.put("/cart/rules", authMiddleware, adminMiddleware, adminController.updateCartRules);

// Category Management
adminRoutes.get("/categories", authMiddleware, adminMiddleware, categoryController.listAdmin);
adminRoutes.post("/categories", authMiddleware, adminMiddleware, invalidateCategoryAndProductCache, categoryController.create);
adminRoutes.patch("/categories/:id", authMiddleware, adminMiddleware, invalidateCategoryAndProductCache, categoryController.update);
adminRoutes.delete("/categories/:id", authMiddleware, adminMiddleware, invalidateCategoryAndProductCache, categoryController.delete);

// Coupon Management
adminRoutes.get("/coupons", authMiddleware, adminMiddleware, couponController.list);
adminRoutes.post("/coupons", authMiddleware, adminMiddleware, couponController.create);
adminRoutes.patch("/coupons/:id", authMiddleware, adminMiddleware, couponController.update);
adminRoutes.delete("/coupons/:id", authMiddleware, adminMiddleware, couponController.delete);
