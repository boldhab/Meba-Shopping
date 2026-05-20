import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import type { OrderStatus, PaymentStatus, MessageCategory } from "@prisma/client";

export const accountService = {
  async getOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOrder(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new ApiError(404, "Order not found.");
    return order;
  },

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.getOrder(userId, orderId);
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      throw new ApiError(400, "Cannot cancel a shipped or delivered order.");
    }

    const paymentStatus = order.paymentStatus === "PAID" ? "REFUNDED" : order.paymentStatus;

    return prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED", paymentStatus },
      include: { items: { include: { product: true } } },
    });
  },

  async returnOrder(userId: string, orderId: string) {
    const order = await this.getOrder(userId, orderId);
    if (order.status !== "DELIVERED") {
      throw new ApiError(400, "Can only return delivered orders.");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: "RETURNED" },
      include: { items: { include: { product: true } } },
    });
  },

  async getWishlist(userId: string) {
    return prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async addWishlistItem(userId: string, itemData: any) {
    // Determine productId from legacy 'id' or 'productId'
    const productId = itemData.productId ?? itemData.id;
    if (!productId) {
       throw new ApiError(400, "Product ID is required to add to wishlist.");
    }
    const quantity = typeof itemData.quantity === 'number' ? itemData.quantity : 1;

    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { quantity },
      create: { userId, productId, quantity },
    });

    return this.getWishlist(userId);
  },

  async updateWishlistItem(userId: string, itemId: string, updates: any) {
    if (updates.quantity !== undefined) {
      await prisma.wishlistItem.updateMany({
        where: { id: itemId, userId },
        data: { quantity: updates.quantity },
      });
    }
    return this.getWishlist(userId);
  },

  async removeWishlistItem(userId: string, itemId: string) {
    await prisma.wishlistItem.deleteMany({
      where: { id: itemId, userId },
    });
    return this.getWishlist(userId);
  },

  async getMessages(userId: string) {
    return prisma.inboxMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async replyToMessage(userId: string, messageId: string, body: string) {
    const message = await prisma.inboxMessage.findUnique({
      where: { id: messageId, userId },
    });
    if (!message) throw new ApiError(404, "Message not found.");

    const replies = Array.isArray(message.replies) ? message.replies : [];
    replies.push({ body, timestamp: new Date().toISOString() });

    const updated = await prisma.inboxMessage.update({
      where: { id: messageId },
      data: { replies, read: true },
    });
    return updated;
  },

  async markMessageReadState(userId: string, messageId: string, read: boolean) {
    const updated = await prisma.inboxMessage.updateMany({
      where: { id: messageId, userId },
      data: { read },
    });
    if (updated.count === 0) throw new ApiError(404, "Message not found.");
    return prisma.inboxMessage.findUnique({ where: { id: messageId } });
  },

  async archiveMessage(userId: string, messageId: string) {
    const updated = await prisma.inboxMessage.updateMany({
      where: { id: messageId, userId },
      data: { archived: true },
    });
    if (updated.count === 0) throw new ApiError(404, "Message not found.");
    return prisma.inboxMessage.findUnique({ where: { id: messageId } });
  },

  async deleteMessage(userId: string, messageId: string) {
    await prisma.inboxMessage.deleteMany({
      where: { id: messageId, userId },
    });
    return this.getMessages(userId);
  },

  async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { addresses: true, preferences: true },
    });
    
    if (!user) throw new ApiError(404, "User not found.");

    return {
      profile: {
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        dob: user.dob ? user.dob.toISOString().split("T")[0] : null,
        gender: user.gender,
      },
      addresses: user.addresses,
      preferences: user.preferences,
    };
  },

  async updateSettings(userId: string, data: any) {
    const { profile, addresses, preferences } = data;

    if (profile) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: profile.fullName,
          phone: profile.phone,
          dob: profile.dob ? new Date(profile.dob) : null,
          gender: profile.gender,
        },
      });
    }

    if (preferences) {
      await prisma.userPreference.upsert({
        where: { userId },
        update: { ...preferences },
        create: { userId, ...preferences },
      });
    }

    if (addresses && Array.isArray(addresses)) {
      await prisma.address.deleteMany({ where: { userId } });
      for (const address of addresses) {
        await prisma.address.create({
          data: {
            userId,
            label: address.label,
            line1: address.line1,
            city: address.city,
            isDefault: address.isDefault,
          },
        });
      }
    }

    return this.getSettings(userId);
  },

  async getUnreadMessageCount(userId: string) {
    return prisma.inboxMessage.count({
      where: { userId, read: false, archived: false },
    });
  },
};
