import { Router } from "express";
import { userController } from "../../controllers/userController";

export const userRoutes = Router();

userRoutes.get("/", userController);
