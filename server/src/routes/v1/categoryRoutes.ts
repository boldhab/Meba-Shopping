import { Router } from "express";
import { categoryController } from "../../controllers/categoryController";

export const categoryRoutes = Router();

categoryRoutes.get("/", categoryController);
