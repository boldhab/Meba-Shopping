import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import { z } from "zod";

const askQuestionSchema = z.object({
  productId: z.string().min(1),
  text: z.string().min(1).max(1000),
});

const answerQuestionSchema = z.object({
  text: z.string().min(1).max(2000),
});

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const qaController = {
  async askQuestion(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) throw new ApiError(401, "Unauthorized");

      const { productId, text } = askQuestionSchema.parse(request.body);

      const question = await prisma.question.create({
        data: {
          text,
          productId,
          userId,
        },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      response.status(201).json(question);
    } catch (error) {
      next(error);
    }
  },

  async getQuestionsByProduct(request: Request, response: Response, next: NextFunction) {
    try {
      const { productId } = request.params;

      const questions = await prisma.question.findMany({
        where: {
          productId,
          status: "APPROVED",
        },
        include: {
          user: { select: { id: true, name: true } },
          answers: {
            include: {
              user: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      response.json(questions);
    } catch (error) {
      next(error);
    }
  },

  async listQuestions(_request: Request, response: Response, next: NextFunction) {
    try {
      const questions = await prisma.question.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, slug: true } },
          answers: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      response.json({ items: questions, total: questions.length });
    } catch (error) {
      next(error);
    }
  },

  async updateQuestionStatus(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      const { status } = updateStatusSchema.parse(request.body);

      const question = await prisma.question.update({
        where: { id },
        data: { status },
      });

      response.json(question);
    } catch (error) {
      next(error);
    }
  },

  async answerQuestion(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request.user?.id;
      if (!userId) throw new ApiError(401, "Unauthorized");

      const { id: questionId } = request.params;
      const { text } = answerQuestionSchema.parse(request.body);

      const answer = await prisma.answer.create({
        data: {
          text,
          questionId,
          userId,
        },
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
      });

      // Automatically approve the question if an admin answers it
      if (request.user?.role === "ADMIN") {
        await prisma.question.update({
          where: { id: questionId },
          data: { status: "APPROVED" },
        });
      }

      response.status(201).json(answer);
    } catch (error) {
      next(error);
    }
  },

  async deleteQuestion(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params;
      await prisma.question.delete({ where: { id } });
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },
};
