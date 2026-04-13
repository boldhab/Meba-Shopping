import { Router } from "express";
import { cartController } from "../../controllers/cartController";
import { authMiddleware } from "../../middleware/authMiddleware";

export const cartRoutes = Router();

cartRoutes.get("/", authMiddleware, cartController);
