import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";

export const adminRoutes = Router();

adminRoutes.get("/", authMiddleware, adminMiddleware, adminController.overview);
adminRoutes.get("/deals", authMiddleware, adminMiddleware, adminController.listDeals);
adminRoutes.patch("/deals/:id", authMiddleware, adminMiddleware, adminController.updateDeal);
