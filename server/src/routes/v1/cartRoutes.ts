import { Router } from "express";
import { cartController } from "../../controllers/cartController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const cartRoutes = Router();

cartRoutes.use(authMiddleware);

cartRoutes.get("/", cartController.getCart);
cartRoutes.post("/items", cartController.addItem);
cartRoutes.patch("/items", cartController.updateItemQuantity);
cartRoutes.delete("/items", cartController.removeItem);
cartRoutes.delete("/clear", cartController.clearCart);
cartRoutes.post("/merge", cartController.mergeGuestCart);
