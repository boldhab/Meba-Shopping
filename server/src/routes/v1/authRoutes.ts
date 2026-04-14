import { Router } from "express";
import { authController } from "../../controllers/authController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validateRequest } from "../../middleware/validationMiddleware";
import {
	loginValidator,
	phoneOtpRequestValidator,
	phoneOtpVerifyValidator,
	registerValidator
} from "../../utils/validators/authValidator";

export const authRoutes = Router();

authRoutes.post("/register", validateRequest(registerValidator), authController.register);
authRoutes.post("/login", validateRequest(loginValidator), authController.login);
authRoutes.get("/google/start", authController.googleStart);
authRoutes.get("/google/callback", authController.googleCallback);
authRoutes.post("/phone/request-otp", validateRequest(phoneOtpRequestValidator), authController.requestPhoneOtp);
authRoutes.post("/phone/verify", validateRequest(phoneOtpVerifyValidator), authController.verifyPhoneOtp);
authRoutes.get("/me", authMiddleware, authController.me);
