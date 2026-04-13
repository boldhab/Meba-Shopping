import { Router } from "express";
import { cartController } from "../../controllers/cartController";

export const cartRoutes = Router();

cartRoutes.get("/", cartController);
