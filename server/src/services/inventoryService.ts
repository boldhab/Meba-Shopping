import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";
import { emailService } from "./emailService";

export const inventoryService = {
  async reserveStock(productId: string, quantity: number, options?: { orderId?: string; expiresInMinutes?: number }) {
    // Use a transaction to create a reservation and decrement stock atomically.
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new ApiError(404, "Product not found.");
      if (product.stock < quantity && !product.allowBackorder) {
        throw new ApiError(400, `Insufficient stock for product ${product.name}`);
      }

      const updated = await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } }
      });

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
      if (updated.stock <= updated.lowStockThreshold) {
        // fire-and-forget: in production use a job queue
        void (async () => {
          try {
            const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
            const emails = admins.map((a) => a.email);
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
    return prisma.$transaction(async (tx) => {
      const reservation = await tx.stockReservation.findUnique({ where: { id: reservationId } });
      if (!reservation) throw new ApiError(404, "Reservation not found.");

      await tx.product.update({ where: { id: reservation.productId }, data: { stock: { increment: reservation.quantity } } });
      return tx.stockReservation.delete({ where: { id: reservationId } });
    });
  },

  async deductStockForOrder(orderId: string) {
    // Called after payment succeeds. Remove reservations tied to order and keep stock as-is (already decremented at reserve).
    const reservations = await prisma.stockReservation.findMany({ where: { orderId } });
    if (!reservations.length) return;

    await prisma.stockReservation.deleteMany({ where: { orderId } });

    // Check low-stock notifications for affected products
    const affectedProductIds = Array.from(new Set(reservations.map((r) => r.productId)));
    for (const pid of affectedProductIds) {
      const p = await prisma.product.findUnique({ where: { id: pid } });
      if (p && p.stock <= p.lowStockThreshold) {
        try {
          const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
          const emails = admins.map((a) => a.email);
          await emailService.sendLowStockNotification(p, emails);
        } catch (e) {
          console.warn("Failed to send low-stock notifications", e);
        }
      }
    }
  }
};
