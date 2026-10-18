import { Router } from "express";
import { productController } from "../../controllers/productController";
import { cacheMiddleware } from "../../middleware/cacheMiddleware";

export const productRoutes = Router();

const catalogCache = cacheMiddleware({ ttlSeconds: 60, prefix: "catalog:products" });

productRoutes.get("/", catalogCache, productController.list);
productRoutes.get("/deals/active", catalogCache, productController.listActiveDeals);
productRoutes.get("/:slug", catalogCache, productController.getBySlug);
