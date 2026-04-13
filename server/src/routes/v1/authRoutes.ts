import { Router } from "express";
import { authController } from "../../controllers/authController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validateRequest } from "../../middleware/validationMiddleware";
import { loginValidator, registerValidator } from "../../utils/validators/authValidator";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest(registerValidator), authController.register);
authRoutes.post("/login", validateRequest(loginValidator), authController.login);
authRoutes.get("/me", authMiddleware, authController.me);
