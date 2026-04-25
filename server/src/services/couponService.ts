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
};
