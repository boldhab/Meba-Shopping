import { Router } from "express";
import { orderController } from "../../controllers/orderController";

export const orderRoutes = Router();

orderRoutes.get("/", orderController);
