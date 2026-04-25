import { Router } from "express";
import { cartController } from "../../controllers/cartController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const cartRoutes = Router();

cartRoutes.post("/quote/guest", cartController.getGuestQuote);

cartRoutes.get("/", authMiddleware, cartController.getCart);
cartRoutes.get("/quote", authMiddleware, cartController.getQuote);
cartRoutes.post("/coupon", authMiddleware, cartController.applyCoupon);
cartRoutes.delete("/coupon", authMiddleware, cartController.removeCoupon);
cartRoutes.post("/items", authMiddleware, cartController.addItem);
cartRoutes.patch("/items", authMiddleware, cartController.updateItemQuantity);
cartRoutes.delete("/items", authMiddleware, cartController.removeItem);
cartRoutes.delete("/clear", authMiddleware, cartController.clearCart);
cartRoutes.post("/merge", authMiddleware, cartController.mergeGuestCart);
