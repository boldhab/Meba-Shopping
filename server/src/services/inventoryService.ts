import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import { emailService } from "./emailService";

export const inventoryService = {
  async reserveStock(productId: string, quantity: number, options?: { orderId?: string; expiresInMinutes?: number }) {
    // Use a transaction to create a reservation and decrement stock atomically.
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new ApiError(404, "Product not found.");

      if (!product.allowBackorder) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: productId,
            stock: { gte: quantity },
          },
          data: { stock: { decrement: quantity } },
        });

        if (updateResult.count === 0) {
          throw new ApiError(400, `Insufficient stock for product ${product.name}`);
        }
      } else {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
      }

      const updated = await tx.product.findUnique({ where: { id: productId } });
      const expiresAt = options?.expiresInMinutes ? new Date(Date.now() + options.expiresInMinutes * 60000) : null;

      const reservation = await tx.stockReservation.create({
        data: {
          productId,
          orderId: options?.orderId,
          quantity,
          expiresAt
        }
      });

      // If we've hit low stock, notify admins asynchronously (do not block the transaction long).
      if (updated && updated.stock <= updated.lowStockThreshold) {
        // fire-and-forget: in production use a job queue
        void (async () => {
          try {
            const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
            const emails = admins.map((a: any) => a.email);
            await emailService.sendLowStockNotification(updated, emails);
          } catch (e) {
            console.warn("Failed to send low-stock notifications", e);
          }
        })();
      }

      return reservation;
    });
  },

  async releaseStock(reservationId: string) {
    // Delete reservation and increment stock
    return prisma.$transaction(async (tx: any) => {
      const reservation = await tx.stockReservation.findUnique({ where: { id: reservationId } });
      if (!reservation) throw new ApiError(404, "Reservation not found.");

      await tx.product.update({ where: { id: reservation.productId }, data: { stock: { increment: reservation.quantity } } });
      return tx.stockReservation.delete({ where: { id: reservationId } });
    });
  },

  async releaseStockForOrder(orderId: string) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Check if active reservations exist for this order
      const reservations = await tx.stockReservation.findMany({ where: { orderId } });

      if (reservations.length > 0) {
        for (const res of reservations) {
          await tx.product.update({
            where: { id: res.productId },
            data: { stock: { increment: res.quantity } }
          });
        }
        await tx.stockReservation.deleteMany({ where: { orderId } });
        return { restoredCount: reservations.length, mode: "reservation" };
      }

      // 2. If reservations were already removed (e.g. order was paid/finalized and now cancelled/returned):
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      // If order does not exist or was already CANCELLED, stock was already restored once.
      // Do not increment stock again to avoid phantom stock duplication!
      if (!order || order.status === "CANCELLED") {
        return { restoredCount: 0, mode: "already_cancelled" };
      }

      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
        return { restoredCount: order.items.length, mode: "orderItems" };
      }

      return { restoredCount: 0, mode: "none" };
    });
  },

  async releaseExpiredReservations() {
    const now = new Date();
    const expiredReservations = await prisma.stockReservation.findMany({
      where: {
        expiresAt: { lte: now }
      }
    });

    if (expiredReservations.length === 0) {
      return { releasedCount: 0, cancelledOrdersCount: 0 };
    }

    let releasedCount = 0;
    const affectedOrderIds = new Set<string>();

    for (const reservation of expiredReservations) {
      try {
        await prisma.$transaction(async (tx: any) => {
          await tx.product.update({
            where: { id: reservation.productId },
            data: { stock: { increment: reservation.quantity } }
          });
          await tx.stockReservation.delete({
            where: { id: reservation.id }
          });
        });
        releasedCount += reservation.quantity;
        if (reservation.orderId) {
          affectedOrderIds.add(reservation.orderId);
        }
      } catch (err) {
        console.warn(`[InventoryService] Failed to release expired reservation ${reservation.id}:`, err);
      }
    }

    let cancelledOrdersCount = 0;
    for (const orderId of affectedOrderIds) {
      try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        // Never auto-cancel Cash-on-Delivery (COD) orders!
        const isCodOrder = order?.paymentMethod === "COD";
        if (order && order.status === "PENDING" && order.paymentStatus === "UNPAID" && !isCodOrder) {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: "CANCELLED" }
          });
          cancelledOrdersCount += 1;
        }
      } catch (err) {
        console.warn(`[InventoryService] Failed to cancel expired order ${orderId}:`, err);
      }
    }

    return { releasedCount, cancelledOrdersCount };
  },

  async deductStockForOrder(orderId: string) {
    // Called after payment succeeds. Remove reservations tied to order and keep stock as-is (already decremented at reserve).
    const reservations = await prisma.stockReservation.findMany({ where: { orderId } });
    if (!reservations.length) return;

    await prisma.stockReservation.deleteMany({ where: { orderId } });

    // Check low-stock notifications for affected products
    const affectedProductIds = Array.from(new Set(reservations.map((r: any) => r.productId)));
    for (const pid of affectedProductIds) {
      const p = await prisma.product.findUnique({ where: { id: pid as string } });
      if (p && p.stock <= p.lowStockThreshold) {
        try {
          const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
          const emails = admins.map((a: any) => a.email);
          await emailService.sendLowStockNotification(p, emails);
        } catch (e) {
          console.warn("Failed to send low-stock notifications", e);
        }
      }
    }
  }
};
