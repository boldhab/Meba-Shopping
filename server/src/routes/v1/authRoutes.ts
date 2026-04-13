import { Router } from "express";
import { authController } from "../../controllers/authController";

export const authRoutes = Router();

authRoutes.get("/", authController);
