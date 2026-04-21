import { cartRepository } from "../repositories/cartRepository";
import { ApiError } from "../utils/apiError";

type MergeCartItemInput = {
	productId: string;
	quantity?: number;
	variantId?: string | null;
	variantLabel?: string | null;
};

export function requireProductId(productId?: string) {
	if (!productId?.trim()) {
		throw new ApiError(400, "productId is required.");
	}

	return productId;
}

export function normalizeAddQuantity(quantity?: number) {
	const safeQuantity = Math.floor(quantity ?? 1);

	if (!Number.isFinite(safeQuantity) || safeQuantity < 1) {
		throw new ApiError(400, "quantity must be at least 1.");
	}

	return safeQuantity;
}

export function normalizeUpdateQuantity(quantity?: number) {
	const safeQuantity = Math.floor(quantity ?? 0);

	if (!Number.isFinite(safeQuantity) || safeQuantity < 0) {
		throw new ApiError(400, "quantity must be 0 or greater.");
	}

	return safeQuantity;
}

export const cartService = {
	async getUserCart(userId: string) {
		return cartRepository.getCartByUserId(userId);
	},

	async addItem(
		userId: string,
		input: { productId?: string; quantity?: number; variantId?: string | null; variantLabel?: string | null }
	) {
		return cartRepository.addItem(userId, {
			productId: requireProductId(input.productId),
			quantity: normalizeAddQuantity(input.quantity),
			variantId: input.variantId,
			variantLabel: input.variantLabel,
		});
	},

	async updateItemQuantity(
		userId: string,
		input: { productId?: string; quantity?: number; variantId?: string | null }
	) {
		return cartRepository.updateItemQuantity(userId, {
			productId: requireProductId(input.productId),
			quantity: normalizeUpdateQuantity(input.quantity),
			variantId: input.variantId,
		});
	},

	async removeItem(userId: string, input: { productId?: string; variantId?: string | null }) {
		return cartRepository.removeItem(userId, {
			productId: requireProductId(input.productId),
			variantId: input.variantId,
		});
	},

	async clearCart(userId: string) {
		return cartRepository.clearCart(userId);
	},

	async mergeGuestCart(userId: string, items: MergeCartItemInput[]) {
		for (const item of items) {
			if (!item.productId?.trim()) continue;

			await cartRepository.addItem(userId, {
				productId: item.productId,
				quantity: normalizeAddQuantity(item.quantity),
				variantId: item.variantId,
				variantLabel: item.variantLabel,
			});
		}

		return cartRepository.getCartByUserId(userId);
	},
};
