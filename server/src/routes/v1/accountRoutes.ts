import { Router } from "express";
import { accountController } from "../../controllers/accountController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const accountRoutes = Router();

accountRoutes.use(authMiddleware);

accountRoutes.get("/orders", accountController.getOrders);
accountRoutes.get("/orders/:orderId", accountController.getOrder);
accountRoutes.post("/orders/:orderId/cancel", accountController.cancelOrder);
accountRoutes.post("/orders/:orderId/return", accountController.returnOrder);

accountRoutes.get("/wishlist", accountController.getWishlist);
accountRoutes.post("/wishlist", accountController.addWishlistItem);
accountRoutes.patch("/wishlist/:itemId", accountController.updateWishlistItem);
accountRoutes.delete("/wishlist/:itemId", accountController.deleteWishlistItem);

accountRoutes.get("/messages", accountController.getMessages);
accountRoutes.post("/messages/:messageId/reply", accountController.replyToMessage);
accountRoutes.patch("/messages/:messageId/read", accountController.markMessageRead);
accountRoutes.patch("/messages/:messageId/archive", accountController.archiveMessage);
accountRoutes.delete("/messages/:messageId", accountController.deleteMessage);

accountRoutes.get("/settings", accountController.getSettings);
accountRoutes.put("/settings", accountController.updateSettings);
