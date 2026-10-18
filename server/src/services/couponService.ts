import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";

export const couponService = {
  async validateCoupon(code: string) {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) {
      throw new ApiError(400, "couponCode is required.");
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: normalizedCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (!coupon) {
      throw new ApiError(400, "Invalid or expired coupon code.");
    }

    return {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      expiresAt: coupon.expiresAt,
    };
  },

  async listCoupons() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getCouponById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
    });
  },

  async createCoupon(input: {
    code: string;
    discountPercent: number;
    expiresAt?: Date | string | null;
    isActive?: boolean;
  }) {
    const code = input.code.trim().toUpperCase();
    if (!code) {
      throw new ApiError(400, "Coupon code is required.");
    }

    if (input.discountPercent < 1 || input.discountPercent > 100) {
      throw new ApiError(400, "Discount percentage must be between 1 and 100.");
    }

    const existing = await prisma.coupon.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ApiError(409, `Coupon code '${code}' already exists.`);
    }

    const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

    return prisma.coupon.create({
      data: {
        code,
        discountPercent: Math.round(input.discountPercent),
        expiresAt,
        isActive: input.isActive ?? true,
      },
    });
  },

  async updateCoupon(
    id: string,
    input: {
      code?: string;
      discountPercent?: number;
      expiresAt?: Date | string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new ApiError(404, "Coupon not found.");
    }

    const data: any = {};

    if (input.code !== undefined) {
      const code = input.code.trim().toUpperCase();
      if (!code) throw new ApiError(400, "Coupon code cannot be empty.");
      if (code !== existing.code) {
        const conflict = await prisma.coupon.findUnique({ where: { code } });
        if (conflict && conflict.id !== id) {
          throw new ApiError(409, `Coupon code '${code}' already exists.`);
        }
      }
      data.code = code;
    }

    if (input.discountPercent !== undefined) {
      if (input.discountPercent < 1 || input.discountPercent > 100) {
        throw new ApiError(400, "Discount percentage must be between 1 and 100.");
      }
      data.discountPercent = Math.round(input.discountPercent);
    }

    if (input.expiresAt !== undefined) {
      data.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    }

    if (input.isActive !== undefined) {
      data.isActive = Boolean(input.isActive);
    }

    return prisma.coupon.update({
      where: { id },
      data,
    });
  },

  async deleteCoupon(id: string) {
    const existing = await prisma.coupon.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new ApiError(404, "Coupon not found.");
    }

    return prisma.coupon.delete({
      where: { id },
    });
  },
};
