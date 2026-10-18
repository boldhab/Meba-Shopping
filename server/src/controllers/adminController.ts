import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";
import { normalizeUploadError } from "../middleware/uploadMiddleware";
import { productService } from "../services/productService";
import { inventoryService } from "../services/inventoryService";
import { ApiError } from "../utils/apiError";
import { uploadImage } from "../utils/uploadImage";
import { parseCsv } from "../utils/csvParser";
import { ProductStatus, ReviewStatus } from "@prisma/client";

const updateDealSchema = z
  .object({
    dealType: z.enum(["DAILY", "WEEKLY", "CLEARANCE", "CEREMONY"]).nullable().optional(),
    isDealActive: z.boolean().optional(),
    dealStartAt: z.string().datetime().nullable().optional(),
    dealEndAt: z.string().datetime().nullable().optional(),
    compareAtPrice: z.coerce.number().positive().nullable().optional(),
    discountPercent: z.coerce.number().int().min(1).max(99).nullable().optional(),
    price: z.coerce.number().positive().optional(),
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
  compareAtPrice: z.coerce.number().positive().nullable().optional(),
  discountPercent: z.coerce.number().int().min(1).max(99).nullable().optional(),
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

const abandonedCartQuerySchema = z.object({
  hours: z.coerce.number().int().min(1).max(24 * 30).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const updateCartRulesSchema = z.object({
  minCartValue: z.coerce.number().min(0).max(1_000_000),
  maxQuantityPerProduct: z.coerce.number().int().min(1).max(999),
  freeShippingThreshold: z.coerce.number().min(0).max(1_000_000),
  taxRatePercent: z.coerce.number().min(0).max(100),
  abandonedHours: z.coerce.number().int().min(1).max(24 * 30),
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

function toPercentage(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }

  return Number(((numerator / denominator) * 100).toFixed(2));
}

function toCurrency(value: number) {
  return Number(value.toFixed(2));
}

async function getOrCreateCartRuleConfig() {
  return prisma.cartRuleConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
    },
  });
}

function serializeCartRules(config: {
  minCartValue: { toString(): string } | number;
  maxQuantityPerProduct: number;
  freeShippingThreshold: { toString(): string } | number;
  taxRatePercent: { toString(): string } | number;
  abandonedHours: number;
  updatedAt: Date;
}) {
  return {
    minCartValue: Number(config.minCartValue),
    maxQuantityPerProduct: config.maxQuantityPerProduct,
    freeShippingThreshold: Number(config.freeShippingThreshold),
    taxRatePercent: Number(config.taxRatePercent),
    abandonedHours: config.abandonedHours,
    updatedAt: config.updatedAt,
  };
}

function serializeAbandonedCart(cart: {
  id: string;
  userId: string | null;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: { toString(): string } | number;
      stock: number;
    };
  }>;
}) {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return {
    id: cart.id,
    user: cart.user ? {
      id: cart.user.id,
      name: cart.user.name,
      email: cart.user.email,
    } : null,
    itemCount,
    subtotal: toCurrency(subtotal),
    lastActivityAt: cart.updatedAt,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      quantity: item.quantity,
      stock: item.product.stock,
      unitPrice: Number(item.product.price),
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
        recentOrders: recentOrders.map((order: any) => ({
          ...order,
          totalAmount: Number(order.totalAmount),
        })),
        recentUsers,
      });
    } catch (error) {
      next(error);
    }
  },

  async cartOverview(_request: Request, response: Response, next: NextFunction) {
    try {
      const ruleConfig = await getOrCreateCartRuleConfig();
      const abandonedCutoff = new Date(Date.now() - ruleConfig.abandonedHours * 60 * 60 * 1000);

      const [
        activeCartsCount,
        abandonedCartsCount,
        cartsWithItems,
        convertedCartsCount,
        topCartItems,
        stockSensitiveCarts,
        abandonedPreview,
      ] = await Promise.all([
        prisma.cart.count({ where: { items: { some: {} } } }),
        prisma.cart.count({
          where: {
            updatedAt: { lte: abandonedCutoff },
            items: { some: {} },
          },
        }),
        prisma.cart.findMany({
          where: { items: { some: {} } },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    price: true,
                  },
                },
              },
            },
          },
        }),
        prisma.cart.count({
          where: {
            items: { some: {} },
            user: {
              orders: {
                some: {},
              },
            },
          },
        }),
        prisma.cartItem.groupBy({
          by: ["productId"],
          _sum: {
            quantity: true,
          },
          orderBy: {
            _sum: {
              quantity: "desc",
            },
          },
          take: 5,
        }),
        prisma.cart.findMany({
          where: { items: { some: {} } },
          select: {
            items: {
              select: {
                quantity: true,
                product: {
                  select: {
                    stock: true,
                  },
                },
              },
            },
          },
        }),
        prisma.cart.findMany({
          where: {
            updatedAt: { lte: abandonedCutoff },
            items: { some: {} },
          },
          orderBy: { updatedAt: "asc" },
          take: 8,
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
                    price: true,
                    stock: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      const productIds = topCartItems.map((item: any) => item.productId);
      const products = (productIds.length
        ? await prisma.product.findMany({
            where: {
              id: {
                in: productIds,
              },
            },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          })
        : []) as Array<{ id: string; name: string; slug: string }>;

      const productsById = new Map(products.map((product) => [product.id, product]));
      const topProducts = topCartItems.map((item: any) => ({
        productId: item.productId,
        productName: productsById.get(item.productId)?.name ?? "Unknown product",
        productSlug: productsById.get(item.productId)?.slug ?? "",
        totalQuantity: item._sum.quantity ?? 0,
      }));

      const averageCartValue = cartsWithItems.length
        ? toCurrency(
            cartsWithItems.reduce((sum: number, cart: any) => {
              const subtotal = cart.items.reduce(
                (innerSum: number, item: any) => innerSum + Number(item.product.price) * item.quantity,
                0
              );

              return sum + subtotal;
            }, 0) / cartsWithItems.length
          )
        : 0;

      const stockIssueItems = stockSensitiveCarts.reduce((sum: number, cart: any) => {
        const issues = cart.items.filter((item: any) => item.quantity > item.product.stock || item.product.stock <= 0);
        return sum + issues.length;
      }, 0);

      response.json({
        metrics: {
          activeCarts: activeCartsCount,
          abandonedCarts: abandonedCartsCount,
          abandonedRate: toPercentage(abandonedCartsCount, activeCartsCount),
          averageCartValue,
          cartToCheckoutConversionRate: toPercentage(convertedCartsCount, activeCartsCount),
          stockIssueItems,
        },
        topProducts,
        abandonedPreview: abandonedPreview.map(serializeAbandonedCart),
        rules: serializeCartRules(ruleConfig),
      });
    } catch (error) {
      next(error);
    }
  },

  async listAbandonedCarts(request: Request, response: Response, next: NextFunction) {
    try {
      const query = abandonedCartQuerySchema.parse(request.query);
      const fallbackRules = await getOrCreateCartRuleConfig();
      const abandonedHours = query.hours ?? fallbackRules.abandonedHours;
      const cutoff = new Date(Date.now() - abandonedHours * 60 * 60 * 1000);
      const skip = (query.page - 1) * query.limit;

      const [total, carts] = await Promise.all([
        prisma.cart.count({
          where: {
            updatedAt: { lte: cutoff },
            items: { some: {} },
          },
        }),
        prisma.cart.findMany({
          where: {
            updatedAt: { lte: cutoff },
            items: { some: {} },
          },
          orderBy: { updatedAt: "asc" },
          skip,
          take: query.limit,
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
                    price: true,
                    stock: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      response.json({
        page: query.page,
        limit: query.limit,
        total,
        cutoff,
        items: carts.map(serializeAbandonedCart),
      });
    } catch (error) {
      next(error);
    }
  },

  async getCartRules(_request: Request, response: Response, next: NextFunction) {
    try {
      const config = await getOrCreateCartRuleConfig();
      response.json(serializeCartRules(config));
    } catch (error) {
      next(error);
    }
  },

  async updateCartRules(request: Request, response: Response, next: NextFunction) {
    try {
      const payload = updateCartRulesSchema.parse(request.body);
      const userId = request.user?.id ?? null;

      const updated = await prisma.cartRuleConfig.upsert({
        where: { id: "default" },
        update: {
          minCartValue: payload.minCartValue,
          maxQuantityPerProduct: payload.maxQuantityPerProduct,
          freeShippingThreshold: payload.freeShippingThreshold,
          taxRatePercent: payload.taxRatePercent,
          abandonedHours: payload.abandonedHours,
          updatedById: userId,
        },
        create: {
          id: "default",
          minCartValue: payload.minCartValue,
          maxQuantityPerProduct: payload.maxQuantityPerProduct,
          freeShippingThreshold: payload.freeShippingThreshold,
          taxRatePercent: payload.taxRatePercent,
          abandonedHours: payload.abandonedHours,
          updatedById: userId,
        },
      });

      response.json(serializeCartRules(updated));
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

  async listProducts(request: Request, response: Response, next: NextFunction) {
    try {
      const { search, status, sort, page, limit } = request.query as {
        search?: string;
        status?: string;
        sort?: string;
        page?: string;
        limit?: string;
      };

      const result = await productService.listProductsForAdmin({
        search,
        status,
        sort,
        page,
        limit,
      });
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

      if (payload.status === "CANCELLED") {
        try {
          await inventoryService.releaseStockForOrder(existingOrder.id);
        } catch (e) {
          console.warn("Error releasing stock on admin order cancellation:", e);
        }
      }

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
        items: users.map((user: any) => ({
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
        recentOrders: user.orders.map((order: any) => ({
          ...order,
          totalAmount: Number(order.totalAmount),
          items: order.items.map((item: any) => ({
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
      const rows = products.map((p: any) => [
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

      const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");

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
      const parsedRows = parseCsv(csvContent);
      if (parsedRows.length < 2) {
        throw new ApiError(400, "CSV file is empty or missing headers.");
      }

      const headers = parsedRows[0].map((h) => h.trim().replace(/^"|"$/g, ""));
      const dataRows = parsedRows.slice(1);
      let count = 0;
      const errors: Array<{ row: number; error: string }> = [];

      for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
        const rowValues = dataRows[rowIndex];
        try {
          const item: any = {};
          headers.forEach((h, i) => {
            const val = rowValues[i]?.trim();
            if (val === undefined || val === "") return;
            if (h === "price" || h === "stock" || h === "lowStockThreshold") {
              const num = Number(val);
              if (!isNaN(num)) item[h] = num;
            } else if (h === "isFeatured" || h === "allowBackorder") {
              item[h] = val.toLowerCase() === "true" || val === "1";
            } else if (h === "status") {
              const upperStatus = val.toUpperCase();
              if (Object.values(ProductStatus).includes(upperStatus as any)) {
                item[h] = upperStatus;
              }
            } else {
              item[h] = val;
            }
          });

          if (!item.name) {
            errors.push({ row: rowIndex + 2, error: "Product name is required" });
            continue;
          }

          if (!item.slug) {
            item.slug = item.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "");
          }

          if (item.price === undefined || isNaN(Number(item.price))) {
            errors.push({ row: rowIndex + 2, error: "Valid product price is required" });
            continue;
          }

          let targetCategoryId = item.categoryId;
          if (targetCategoryId) {
            const cat = await prisma.category.findFirst({
              where: {
                OR: [
                  { id: targetCategoryId },
                  { slug: targetCategoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
                  { name: { equals: targetCategoryId, mode: "insensitive" } },
                ],
              },
              select: { id: true },
            });
            if (cat) {
              targetCategoryId = cat.id;
            } else {
              const slug =
                targetCategoryId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "general";
              const newCat = await prisma.category.upsert({
                where: { slug },
                update: {},
                create: { name: targetCategoryId, slug },
              });
              targetCategoryId = newCat.id;
            }
          } else {
            const defaultCat = await prisma.category.upsert({
              where: { slug: "general" },
              update: {},
              create: { name: "General", slug: "general" },
            });
            targetCategoryId = defaultCat.id;
          }
          item.categoryId = targetCategoryId;

          if (item.id) {
            const existing = await prisma.product.findUnique({
              where: { id: item.id },
              select: { id: true },
            });
            if (existing) {
              const { id, ...dataToUpdate } = item;
              await prisma.product.update({
                where: { id },
                data: dataToUpdate,
              });
              count++;
              continue;
            }
          }

          const existingBySlug = await prisma.product.findUnique({
            where: { slug: item.slug },
            select: { id: true },
          });

          if (existingBySlug) {
            const { id, ...dataToUpdate } = item;
            await prisma.product.update({
              where: { id: existingBySlug.id },
              data: dataToUpdate,
            });
          } else {
            const { id, ...dataToCreate } = item;
            await prisma.product.create({
              data: {
                ...dataToCreate,
                price: Number(dataToCreate.price),
                stock: dataToCreate.stock !== undefined ? Number(dataToCreate.stock) : 0,
              },
            });
          }
          count++;
        } catch (rowError: any) {
          errors.push({ row: rowIndex + 2, error: rowError.message || "Failed to process row" });
        }
      }

      response.json({
        message: `Successfully processed ${count} products.` + (errors.length > 0 ? ` (${errors.length} rows had errors).` : ""),
        count,
        errors,
      });
    } catch (error) {
      next(error);
    }
  },
};
