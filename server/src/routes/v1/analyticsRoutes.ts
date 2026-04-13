import { Router } from "express";
import { analyticsController } from "../../controllers/analyticsController";

export const analyticsRoutes = Router();

analyticsRoutes.get("/", analyticsController);
