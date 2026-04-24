import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { normalizeUploadError } from "../middleware/uploadMiddleware";
import { productService } from "../services/productService";
import { ApiError } from "../utils/apiError";
import { uploadImage } from "../utils/uploadImage";
import { ProductStatus, ReviewStatus } from "@prisma/client";

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
  imageUrl: z.string().url().nullable().optional(),
  description: z.string().max(3000).nullable().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  status: z.nativeEnum(ProductStatus).optional(),
  isFeatured: z.boolean().optional(),
  allowBackorder: z.boolean().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  seoTitle: z.string().max(120).nullable().optional(),
  seoDescription: z.string().max(300).nullable().optional(),
  seoKeywords: z.string().max(200).nullable().optional(),
  attributes: z.any().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

const updateReviewStatusSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
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

      const [
        totalProducts,
        activeDeals,
        totalUsers,
        totalOrders,
        lowStockProducts,
        recentOrders,
        recentUsers,
        allProducts,
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
        // We fetch products where stock is <= their individual lowStockThreshold
        prisma.product.findMany({
          where: {
            OR: [
              { stock: { lte: 10 }, lowStockThreshold: 10 }, // Fallback for default
              {
                AND: [
                  { lowStockThreshold: { not: 10 } },
                  { stock: { lte: prisma.product.fields.lowStockThreshold } }
                ]
              }
            ]
          },
          orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
          take: 5,
          select: {
            id: true,
            name: true,
            slug: true,
            stock: true,
            lowStockThreshold: true,
            dealType: true,
            isDealActive: true,
          },
        }).catch(async () => {
          // Prisma doesn't support field-to-field comparison directly in 'where' easily without raw or specific client logic
          // Simplified fallback for now:
          return prisma.product.findMany({
            where: { stock: { lte: 10 } },
            orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
            take: 5,
            select: {
              id: true,
              name: true,
              slug: true,
              stock: true,
              lowStockThreshold: true,
              dealType: true,
              isDealActive: true,
            },
          });
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
        // Fetch sales data for analytics (simplified)
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        })
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
      const uploadedImage = request.file
        ? await uploadImage({
            buffer: request.file.buffer,
            mimeType: request.file.mimetype,
            fileName: request.file.originalname,
          })
        : null;

      const imageUrl = uploadedImage?.url ?? payload.imageUrl ?? null;
      if (!imageUrl) {
        throw new ApiError(400, "Product image is required.");
      }

      const product = await productService.createProduct({
        ...payload,
        imageUrl,
      });
      response.status(201).json(product);
    } catch (error) {
      next(normalizeUploadError(error));
    }
  },

  async updateProduct(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = upsertProductSchema.parse(request.body);
      const uploadedImage = request.file
        ? await uploadImage({
            buffer: request.file.buffer,
            mimeType: request.file.mimetype,
            fileName: request.file.originalname,
          })
        : null;

      const product = await productService.updateProduct(String(request.params.id), {
        ...payload,
        imageUrl: uploadedImage?.url ?? payload.imageUrl ?? undefined,
      });

      if (!product) {
        throw new ApiError(404, "Product not found.");
      }

      response.json(product);
    } catch (error) {
      next(normalizeUploadError(error));
    }
  },

  async deleteProduct(request: Request, response: Response, next: NextFunction) {
    try {
      const product = await productService.deleteProduct(String(request.params.id));
      if (!product) {
        throw new ApiError(404, "Product not found.");
      }
      response.status(200).json({ message: "Product archived successfully.", product });
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

  async listReviews(_request: Request, response: Response, next: NextFunction) {
    try {
      const reviews = await prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, slug: true } },
        },
      });
      response.json({ items: reviews, total: reviews.length });
    } catch (error) {
      next(error);
    }
  },

  async updateReviewStatus(request: Request, response: Response, next: NextFunction) {
    try {
      const rawId = request.params.id;
      if (!rawId || Array.isArray(rawId)) {
        throw new ApiError(400, "Invalid review id.");
      }

      const id = rawId;
      const { status } = updateReviewStatusSchema.parse(request.body);

      const review = await prisma.review.update({
        where: { id },
        data: { status },
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, name: true, slug: true } },
        },
      });

      response.json(review);
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(request: Request, response: Response, next: NextFunction) {
    try {
      const rawId = request.params.id;
      if (!rawId || Array.isArray(rawId)) {
        throw new ApiError(400, "Invalid review id.");
      }

      const id = rawId;
      await prisma.review.delete({ where: { id } });
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  async exportProducts(_request: Request, response: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        include: { category: true },
      });

      const headers = ["id", "name", "slug", "price", "stock", "categoryId", "status", "isFeatured", "allowBackorder", "lowStockThreshold"];
      const rows = products.map((p) => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.slug,
        p.price,
        p.stock,
        p.categoryId,
        p.status,
        p.isFeatured,
        p.allowBackorder,
        p.lowStockThreshold,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      response.setHeader("Content-Type", "text/csv");
      response.setHeader("Content-Disposition", `attachment; filename=products_${new Date().toISOString().split("T")[0]}.csv`);
      response.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  },

  async importProducts(request: Request, response: Response, next: NextFunction) {
    try {
      if (!request.file) {
        throw new ApiError(400, "CSV file is required.");
      }

      const csvContent = request.file.buffer.toString("utf-8");
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== "");
      if (lines.length < 2) {
        throw new ApiError(400, "CSV file is empty or missing headers.");
      }

      const headers = lines[0].split(",");
      const dataRows = lines.slice(1);
      let count = 0;

      for (const row of dataRows) {
        const values = row.split(","); // Simple split, won't handle commas in quotes perfectly
        const item: any = {};
        headers.forEach((h, i) => {
          let val = values[i]?.replace(/^"|"$/g, "");
          if (h === "price" || h === "stock" || h === "lowStockThreshold") {
            item[h] = Number(val);
          } else if (h === "isFeatured" || h === "allowBackorder") {
            item[h] = val === "true";
          } else {
            item[h] = val;
          }
        });

        if (item.slug && item.name && item.price !== undefined) {
          if (item.id) {
            await prisma.product.update({
              where: { id: item.id },
              data: { ...item, id: undefined },
            });
          } else {
            await prisma.product.create({
              data: item,
            });
          }
          count++;
        }
      }

      response.json({ message: `Successfully processed ${count} products.`, count });
    } catch (error) {
      next(error);
    }
  },
};
