import { Router } from "express";
import { couponController } from "../../controllers/couponController";

export const couponRoutes = Router();

couponRoutes.get("/", couponController);
