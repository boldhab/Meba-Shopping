import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import { cartService } from "./cartService";
import type { OrderStatus } from "@prisma/client";

export type ShippingDetails = {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  paymentMethod?: string;
};

export const orderService = {
  async createOrder(userId: string, shippingDetails: ShippingDetails) {
    // 1. Get the cart quote to get totals and validate stock
    const quote = await cartService.getCartQuote({ userId });

    if (!quote.items || quote.items.length === 0) {
      throw new ApiError(400, "Cart is empty");
    }

    if (!quote.validation.checkoutAllowed) {
      throw new ApiError(400, "Checkout not allowed due to cart validation errors", {
        stockIssues: quote.validation.stockIssues,
        quantityIssues: quote.validation.quantityIssues,
        meetsMinimumCartValue: quote.validation.meetsMinimumCartValue,
      });
    }

    // 2. Create the order and deduct stock in a transaction
    return await prisma.$transaction(async (tx: any) => {
      const paymentMethod = (shippingDetails.paymentMethod || "CARD").toUpperCase();

      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          paymentMethod,
          totalAmount: quote.totals.total,
          shippingName: shippingDetails.shippingName,
          shippingAddress: shippingDetails.shippingAddress,
          shippingCity: shippingDetails.shippingCity,
          shippingZip: shippingDetails.shippingZip,
          shippingCountry: shippingDetails.shippingCountry,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Atomically verify stock and decrement product stock
      for (const item of quote.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new ApiError(404, `Product not found: ${item.productId}`);
        }

        if (!product.allowBackorder) {
          // Atomic conditional update ensuring stock >= quantity
          const updateResult = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

          if (updateResult.count === 0) {
            throw new ApiError(
              400,
              `Insufficient stock for "${product.name}". Requested ${item.quantity}, but only ${product.stock} available.`
            );
          }
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Only create an expiring 30-minute reservation for online payment (e.g. CARD)
        // COD orders do not expire after 30 minutes!
        if (paymentMethod !== "COD") {
          await tx.stockReservation.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              quantity: item.quantity,
              expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes reservation window
            },
          });
        }
      }

      // Clear the user's cart
      await tx.cart.update({
        where: { userId },
        data: {
          appliedCouponCode: null,
          items: {
            deleteMany: {},
          },
        },
      });

      return order;
    });
  },

  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  },

  async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId, // ensure the user owns the order
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    return order;
  },

  async getOrderForInvoice(orderId: string, userId: string, isAdmin = false) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    if (!isAdmin && order.userId !== userId) {
      throw new ApiError(403, "You do not have permission to access this order invoice");
    }

    return order;
  },
};
