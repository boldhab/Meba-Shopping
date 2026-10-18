import { Router } from "express";
import { analyticsController } from "../../controllers/analyticsController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";

export const analyticsRoutes = Router();

analyticsRoutes.get("/", authMiddleware, adminMiddleware, analyticsController);
