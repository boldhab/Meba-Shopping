import { inventoryService } from "../../../services/inventoryService";
import { prisma } from "../../../prisma/client";

jest.mock("../../../prisma/client", () => ({
  prisma: {
    $transaction: jest.fn(async (callback: any) => callback(prisma)),
    stockReservation: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("inventoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("releaseStockForOrder", () => {
    it("releases stock from active reservations and deletes them", async () => {
      const mockReservations = [
        { id: "res-1", productId: "prod-1", quantity: 2, orderId: "order-123" },
        { id: "res-2", productId: "prod-2", quantity: 1, orderId: "order-123" },
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      (prisma.product.update as jest.Mock).mockResolvedValue({});
      (prisma.stockReservation.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await inventoryService.releaseStockForOrder("order-123");

      expect(prisma.stockReservation.findMany).toHaveBeenCalledWith({ where: { orderId: "order-123" } });
      expect(prisma.product.update).toHaveBeenCalledTimes(2);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { stock: { increment: 2 } },
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-2" },
        data: { stock: { increment: 1 } },
      });
      expect(prisma.stockReservation.deleteMany).toHaveBeenCalledWith({ where: { orderId: "order-123" } });
      expect(result).toEqual({ restoredCount: 2, mode: "reservation" });
    });

    it("restores stock from order items when reservations were already removed", async () => {
      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: "order-123",
        items: [
          { productId: "prod-1", quantity: 3 },
          { productId: "prod-3", quantity: 1 },
        ],
      });
      (prisma.product.update as jest.Mock).mockResolvedValue({});

      const result = await inventoryService.releaseStockForOrder("order-123");

      expect(prisma.product.update).toHaveBeenCalledTimes(2);
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { stock: { increment: 3 } },
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-3" },
        data: { stock: { increment: 1 } },
      });
      expect(result).toEqual({ restoredCount: 2, mode: "orderItems" });
    });

    it("does not duplicate stock release if order is already cancelled", async () => {
      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: "order-123",
        status: "CANCELLED",
        items: [{ productId: "prod-1", quantity: 3 }],
      });

      const result = await inventoryService.releaseStockForOrder("order-123");

      expect(prisma.product.update).not.toHaveBeenCalled();
      expect(result).toEqual({ restoredCount: 0, mode: "already_cancelled" });
    });
  });

  describe("releaseExpiredReservations", () => {
    it("releases expired reservations and cancels pending unpaid orders", async () => {
      const mockExpired = [
        { id: "res-exp-1", productId: "prod-1", quantity: 2, orderId: "order-pending-1" },
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockExpired);
      (prisma.product.update as jest.Mock).mockResolvedValue({});
      (prisma.stockReservation.delete as jest.Mock).mockResolvedValue({});
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: "order-pending-1",
        status: "PENDING",
        paymentStatus: "UNPAID",
      });
      (prisma.order.update as jest.Mock).mockResolvedValue({});

      const result = await inventoryService.releaseExpiredReservations();

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { stock: { increment: 2 } },
      });
      expect(prisma.stockReservation.delete).toHaveBeenCalledWith({
        where: { id: "res-exp-1" },
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-pending-1" },
        data: { status: "CANCELLED" },
      });
      expect(result).toEqual({ releasedCount: 2, cancelledOrdersCount: 1 });
    });

    it("does not cancel pending unpaid orders if paymentMethod is COD", async () => {
      const mockExpired = [
        { id: "res-exp-cod", productId: "prod-1", quantity: 1, orderId: "order-cod-1" },
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockExpired);
      (prisma.product.update as jest.Mock).mockResolvedValue({});
      (prisma.stockReservation.delete as jest.Mock).mockResolvedValue({});
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: "order-cod-1",
        status: "PENDING",
        paymentStatus: "UNPAID",
        paymentMethod: "COD",
      });

      const result = await inventoryService.releaseExpiredReservations();

      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(result).toEqual({ releasedCount: 1, cancelledOrdersCount: 0 });
    });
  });
});
