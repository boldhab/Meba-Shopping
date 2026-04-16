import { Router } from "express";
import { reviewController } from "../../controllers/reviewController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validateRequest } from "../../middleware/validationMiddleware";
import { createReviewValidator } from "../../utils/validators/reviewValidator";

export const reviewRoutes = Router();

reviewRoutes.get("/", reviewController.list);
reviewRoutes.post("/", authMiddleware, validateRequest(createReviewValidator), reviewController.create);
