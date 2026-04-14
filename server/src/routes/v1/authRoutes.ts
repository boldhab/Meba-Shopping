import { Router } from "express";
import { authController } from "../../controllers/authController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validateRequest } from "../../middleware/validationMiddleware";
import {
	loginValidator,
	requestEmailVerificationValidator,
	registerValidator
} from "../../utils/validators/authValidator";

export const authRoutes = Router();

authRoutes.post("/email/request-verification", validateRequest(requestEmailVerificationValidator), authController.requestEmailVerification);
authRoutes.post("/register", validateRequest(registerValidator), authController.register);
authRoutes.post("/login", validateRequest(loginValidator), authController.login);
authRoutes.get("/google/start", authController.googleStart);
authRoutes.get("/google/callback", authController.googleCallback);
authRoutes.get("/me", authMiddleware, authController.me);
