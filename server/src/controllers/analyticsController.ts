import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function analyticsController(_request: Request, response: Response, next: NextFunction) {
  try {
    const [
      totalUsers,
      totalOrders,
      totalProducts,
      ordersByStatus,
      paidOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.findMany({
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.product.count({
        where: { stock: { lte: 10 } },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);

    const statusCounts = ordersByStatus.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {});

    response.json({
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalUsers,
        totalProducts,
        lowStockProducts,
      },
      ordersByStatus: statusCounts,
      recentPaidVolume: paidOrders.length,
    });
  } catch (error) {
    next(error);
  }
}
