import { Router } from "express";
import { categoryController } from "../../controllers/categoryController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";
import { cacheMiddleware, invalidateCacheMiddleware } from "../../middleware/cacheMiddleware";

export const categoryRoutes = Router();

const categoryCache = cacheMiddleware({ ttlSeconds: 300, prefix: "catalog:categories" });
const invalidateCategoryAndProducts = invalidateCacheMiddleware(["catalog:categories*", "catalog:products*"]);

categoryRoutes.get("/", categoryCache, categoryController.list);
categoryRoutes.get("/:slug", categoryCache, categoryController.getBySlug);
categoryRoutes.post("/", authMiddleware, adminMiddleware, invalidateCategoryAndProducts, categoryController.create);
categoryRoutes.patch("/:id", authMiddleware, adminMiddleware, invalidateCategoryAndProducts, categoryController.update);
categoryRoutes.delete("/:id", authMiddleware, adminMiddleware, invalidateCategoryAndProducts, categoryController.delete);
