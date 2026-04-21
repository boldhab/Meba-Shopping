import { cartRepository } from "../repositories/cartRepository";
import { ApiError } from "../utils/apiError";

type MergeCartItemInput = {
	productId: string;
	quantity?: number;
	variantId?: string | null;
	variantLabel?: string | null;
};

export const cartService = {
	async getUserCart(userId: string) {
		return cartRepository.getCartByUserId(userId);
	},

	async addItem(
		userId: string,
		input: { productId?: string; quantity?: number; variantId?: string | null; variantLabel?: string | null }
	) {
		if (!input.productId) {
			throw new ApiError(400, "productId is required.");
		}

		return cartRepository.addItem(userId, {
			productId: input.productId,
			quantity: input.quantity ?? 1,
			variantId: input.variantId,
			variantLabel: input.variantLabel,
		});
	},

	async updateItemQuantity(
		userId: string,
		input: { productId?: string; quantity?: number; variantId?: string | null }
	) {
		if (!input.productId) {
			throw new ApiError(400, "productId is required.");
		}

		return cartRepository.updateItemQuantity(userId, {
			productId: input.productId,
			quantity: input.quantity ?? 0,
			variantId: input.variantId,
		});
	},

	async removeItem(userId: string, input: { productId?: string; variantId?: string | null }) {
		if (!input.productId) {
			throw new ApiError(400, "productId is required.");
		}

		return cartRepository.removeItem(userId, {
			productId: input.productId,
			variantId: input.variantId,
		});
	},

	async clearCart(userId: string) {
		return cartRepository.clearCart(userId);
	},

	async mergeGuestCart(userId: string, items: MergeCartItemInput[]) {
		for (const item of items) {
			if (!item.productId) continue;

			await cartRepository.addItem(userId, {
				productId: item.productId,
				quantity: Math.max(1, item.quantity ?? 1),
				variantId: item.variantId,
				variantLabel: item.variantLabel,
			});
		}

		return cartRepository.getCartByUserId(userId);
	},
};
