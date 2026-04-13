import { Router } from "express";
import { userController } from "../../controllers/userController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const userRoutes = Router();

userRoutes.get("/", authMiddleware, userController);
