import { Router } from "express";
import { cartController } from "../../controllers/cartController";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/authMiddleware";

export const cartRoutes = Router();

cartRoutes.post("/quote/guest", cartController.getGuestQuote);

cartRoutes.get("/", optionalAuthMiddleware, cartController.getCart);
cartRoutes.get("/quote", optionalAuthMiddleware, cartController.getQuote);
cartRoutes.post("/coupon", optionalAuthMiddleware, cartController.applyCoupon);
cartRoutes.delete("/coupon", optionalAuthMiddleware, cartController.removeCoupon);
cartRoutes.post("/items", optionalAuthMiddleware, cartController.addItem);
cartRoutes.patch("/items", optionalAuthMiddleware, cartController.updateItemQuantity);
cartRoutes.delete("/items", optionalAuthMiddleware, cartController.removeItem);
cartRoutes.delete("/clear", optionalAuthMiddleware, cartController.clearCart);
cartRoutes.post("/merge", authMiddleware, cartController.mergeGuestCart);
