import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { productService } from "../services/productService";
import { ApiError } from "../utils/apiError";

const updateDealSchema = z
  .object({
    dealType: z.enum(["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"]).nullable().optional(),
    isDealActive: z.boolean().optional(),
    dealStartAt: z.string().datetime().nullable().optional(),
    dealEndAt: z.string().datetime().nullable().optional(),
  })
  .refine(
    (payload) => {
      if (!payload.dealStartAt || !payload.dealEndAt) {
        return true;
      }

      return new Date(payload.dealStartAt).getTime() <= new Date(payload.dealEndAt).getTime();
    },
    {
      message: "dealStartAt must be before or equal to dealEndAt.",
      path: ["dealStartAt"],
    }
  );

const upsertProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens only."),
  description: z.string().max(3000).nullable().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

const allowedOrderStatusTransitions: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function serializeAdminOrder(order: {
  id: string;
  status: string;
  totalAmount: { toString(): string } | number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role?: string;
    createdAt?: Date;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: { toString(): string } | number;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}) {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
    })),
  };
}

export const adminController = {
  async overview(_request: Request, response: Response, next: NextFunction) {
    try {
      const now = new Date();
      const lowStockThreshold = 10;

      const [
        totalProducts,
        activeDeals,
        totalUsers,
        totalOrders,
        lowStockProducts,
        recentOrders,
        recentUsers,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({
          where: {
            isDealActive: true,
            AND: [
              {
                OR: [{ dealStartAt: null }, { dealStartAt: { lte: now } }],
              },
              {
                OR: [{ dealEndAt: null }, { dealEndAt: { gte: now } }],
              },
            ],
          },
        }),
        prisma.user.count(),
        prisma.order.count(),
        prisma.product.findMany({
          where: { stock: { lte: lowStockThreshold } },
          orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            stock: true,
            dealType: true,
            isDealActive: true,
          },
        }),
        prisma.order.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
      ]);

      response.json({
        stats: {
          totalProducts,
          activeDeals,
          totalUsers,
          totalOrders,
          lowStockProducts: lowStockProducts.length,
        },
        lowStockProducts,
        recentOrders: recentOrders.map((order) => ({
          ...order,
          totalAmount: Number(order.totalAmount),
        })),
        recentUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  async listDeals(_request: Request, response: Response, next: NextFunction) {
    try {
      const result = await productService.listProductsForAdminDeals();
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async listProducts(_request: Request, response: Response, next: NextFunction) {
    try {
      const result = await productService.listProductsForAdmin();
      response.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getProduct(request: Request, response: Response, next: NextFunction) {
    try {
      const product = await productService.getProductById(String(request.params.id));

      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      response.json(product);
    } catch (error) {
      next(error);
    }
  },

  async createProduct(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = upsertProductSchema.parse(request.body);
      const product = await productService.createProduct(payload);
      response.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = upsertProductSchema.parse(request.body);
      const product = await productService.updateProduct(String(request.params.id), payload);

      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      response.json(product);
    } catch (error) {
      next(error);
    }
  },

  async listOrders(_request: Request, response: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      response.json({
        items: orders.map(serializeAdminOrder),
        total: orders.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async getOrder(request: Request, response: Response, next: NextFunction) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: String(request.params.id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new ApiError(404, "Order not found.");
      }

      response.json({
        ...serializeAdminOrder(order),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = updateOrderStatusSchema.parse(request.body);

      const existingOrder = await prisma.order.findUnique({
        where: { id: String(request.params.id) },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!existingOrder) {
        throw new ApiError(404, "Order not found.");
      }

      if (existingOrder.status === payload.status) {
        return response.json(serializeAdminOrder(existingOrder));
      }

      const allowedStatuses = allowedOrderStatusTransitions[existingOrder.status] ?? [];
      if (!allowedStatuses.includes(payload.status)) {
        throw new ApiError(
          400,
          `Cannot change order status from ${existingOrder.status} to ${payload.status}.`
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: { status: payload.status },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      response.json(serializeAdminOrder(updatedOrder));
    } catch (error) {
      next(error);
    }
  },

  async listUsers(_request: Request, response: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      });

      response.json({
        items: users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          orderCount: user._count.orders,
          reviewCount: user._count.reviews,
        })),
        total: users.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUser(request: Request, response: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: String(request.params.id) },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      });

      if (!user) {
        throw new ApiError(404, "User not found.");
      }

      response.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        orderCount: user._count.orders,
        reviewCount: user._count.reviews,
        recentOrders: user.orders.map((order) => ({
          ...order,
          totalAmount: Number(order.totalAmount),
          items: order.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
          })),
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDeal(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = updateDealSchema.parse(request.body);
      const product = await productService.updateProductDeal(String(request.params.id), payload);

      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      response.json(product);
    } catch (error) {
      next(error);
    }
  },
};
