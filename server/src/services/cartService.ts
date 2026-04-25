import { cartRepository, type CartIdentifier } from "../repositories/cartRepository";
import { ApiError } from "../utils/apiError";

type MergeCartItemInput = {
	productId: string;
	quantity?: number;
	variantId?: string | null;
	variantLabel?: string | null;
};

type QuoteCartItemInput = {
	productId?: string;
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
	async getCart(id: CartIdentifier) {
		return cartRepository.getCart(id);
	},

	async getCartQuote(id: CartIdentifier) {
		return cartRepository.getCartQuote(id);
	},

	async getGuestCartQuote(items: QuoteCartItemInput[], couponCode?: string) {
		const normalizedItems = items
			.filter((item) => typeof item?.productId === "string" && item.productId.trim().length > 0)
			.map((item) => ({
				productId: item.productId!.trim(),
				quantity: normalizeAddQuantity(item.quantity),
				variantId: item.variantId,
				variantLabel: item.variantLabel,
			}));

		return cartRepository.getGuestCartQuote(normalizedItems, couponCode);
	},

	async applyCoupon(id: CartIdentifier, couponCode?: string) {
		if (!couponCode?.trim()) {
			throw new ApiError(400, "couponCode is required.");
		}

		return cartRepository.applyCoupon(id, couponCode.trim());
	},

	async removeCoupon(id: CartIdentifier) {
		return cartRepository.removeCoupon(id);
	},

	async addItem(
		id: CartIdentifier,
		input: { productId?: string; quantity?: number; variantId?: string | null; variantLabel?: string | null }
	) {
		return cartRepository.addItem(id, {
			productId: requireProductId(input.productId),
			quantity: normalizeAddQuantity(input.quantity),
			variantId: input.variantId,
			variantLabel: input.variantLabel,
		});
	},

	async updateItemQuantity(
		id: CartIdentifier,
		input: { productId?: string; quantity?: number; variantId?: string | null }
	) {
		return cartRepository.updateItemQuantity(id, {
			productId: requireProductId(input.productId),
			quantity: normalizeUpdateQuantity(input.quantity),
			variantId: input.variantId,
		});
	},

	async removeItem(id: CartIdentifier, input: { productId?: string; variantId?: string | null }) {
		return cartRepository.removeItem(id, {
			productId: requireProductId(input.productId),
			variantId: input.variantId,
		});
	},

	async clearCart(id: CartIdentifier) {
		return cartRepository.clearCart(id);
	},

	async mergeGuestCart(userId: string, items: MergeCartItemInput[]) {
		const id = { userId };
		for (const item of items) {
			if (!item.productId?.trim()) continue;

			await cartRepository.addItem(id, {
				productId: item.productId,
				quantity: normalizeAddQuantity(item.quantity),
				variantId: item.variantId,
				variantLabel: item.variantLabel,
			});
		}

		return cartRepository.getCart(id);
	},
};
