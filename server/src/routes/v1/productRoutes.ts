import { Router } from "express";
import { productController } from "../../controllers/productController";

export const productRoutes = Router();

productRoutes.get("/", productController.list);
productRoutes.get("/deals/active", productController.listActiveDeals);
productRoutes.get("/:slug", productController.getBySlug);

