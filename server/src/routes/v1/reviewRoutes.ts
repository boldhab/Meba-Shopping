import { Router } from "express";
import { reviewController } from "../../controllers/reviewController";

export const reviewRoutes = Router();

reviewRoutes.get("/", reviewController);
