import { Router } from "express";
import { adminController } from "../../controllers/adminController";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { authMiddleware } from "../../middleware/authMiddleware";

export const adminRoutes = Router();

adminRoutes.get("/", authMiddleware, adminMiddleware, adminController);
