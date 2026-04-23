import { Router } from "express";
import { qaController } from "../../controllers/qaController";
import { authMiddleware } from "../../middleware/authMiddleware";
import { adminMiddleware } from "../../middleware/adminMiddleware";

export const qaRoutes = Router();

// Public
qaRoutes.get("/products/:productId", qaController.getQuestionsByProduct);
qaRoutes.post("/", authMiddleware, qaController.askQuestion);

// Admin / Moderation
qaRoutes.get("/admin", authMiddleware, adminMiddleware, qaController.listQuestions);
qaRoutes.patch("/admin/:id/status", authMiddleware, adminMiddleware, qaController.updateQuestionStatus);
qaRoutes.post("/admin/:id/answer", authMiddleware, adminMiddleware, qaController.answerQuestion);
qaRoutes.delete("/admin/:id", authMiddleware, adminMiddleware, qaController.deleteQuestion);
