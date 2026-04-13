import { Router } from "express";
import { adminController } from "../../controllers/adminController";

export const adminRoutes = Router();

adminRoutes.get("/", adminController);
