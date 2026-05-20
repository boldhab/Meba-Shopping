import { prisma } from "../prisma";
import { ApiError } from "../utils/apiError";
import { cartService } from "./cartService";
import type { OrderStatus } from "@prisma/client";

export type ShippingDetails = {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
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
    return await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
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

      // Deduct stock for each item
      for (const item of quote.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
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
};
