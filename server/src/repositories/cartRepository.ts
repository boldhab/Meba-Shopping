import { prisma } from "../prisma/client";
import { ApiError } from "../utils/apiError";

type AddCartItemInput = {
	productId: string;
	quantity: number;
	variantId?: string | null;
	variantLabel?: string | null;
};

type UpdateCartItemInput = {
	productId: string;
	quantity: number;
	variantId?: string | null;
};

function toVariantKey(variantId?: string | null) {
	return variantId?.trim() || "default";
}

function toCartResponse(cart: {
	items: Array<{
		productId: string;
		quantity: number;
		variantId: string | null;
		variantLabel: string | null;
		product: {
			slug: string;
			name: string;
			price: unknown;
			stock: number;
		};
	}>;
}) {
	const items = cart.items.map((item) => ({
		productId: item.productId,
		slug: item.product.slug,
		name: item.product.name,
		price: Number(item.product.price),
		quantity: item.quantity,
		stock: item.product.stock,
		variantId: item.variantId,
		variantLabel: item.variantLabel,
	}));

	return {
		items,
		total: items.reduce((sum, item) => sum + item.quantity, 0),
	};
}

export const cartRepository = {
	async getOrCreateCart(userId: string) {
		return prisma.cart.upsert({
			where: { userId },
			create: { userId },
			update: {},
		});
	},

	async getCartByUserId(userId: string) {
		const cart = await prisma.cart.upsert({
			where: { userId },
			create: { userId },
			update: {},
			include: {
				items: {
					include: {
						product: true,
					},
					orderBy: { createdAt: "desc" },
				},
			},
		});

		return toCartResponse(cart);
	},

	async addItem(userId: string, input: AddCartItemInput) {
		const safeQuantity = Math.max(1, Math.floor(input.quantity || 1));
		const variantKey = toVariantKey(input.variantId);

		const product = await prisma.product.findUnique({ where: { id: input.productId } });
		if (!product) {
			throw new ApiError(404, "Product not found.");
		}

		const cart = await this.getOrCreateCart(userId);
		const existing = await prisma.cartItem.findUnique({
			where: {
				cartId_productId_variantKey: {
					cartId: cart.id,
					productId: input.productId,
					variantKey,
				},
			},
		});

		const requestedQuantity = (existing?.quantity ?? 0) + safeQuantity;
		const clampedQuantity = Math.min(requestedQuantity, Math.max(product.stock, 0));

		if (clampedQuantity <= 0) {
			throw new ApiError(400, "Product is currently out of stock.");
		}

		await prisma.cartItem.upsert({
			where: {
				cartId_productId_variantKey: {
					cartId: cart.id,
					productId: input.productId,
					variantKey,
				},
			},
			create: {
				cartId: cart.id,
				productId: input.productId,
				quantity: clampedQuantity,
				variantId: input.variantId ?? null,
				variantKey,
				variantLabel: input.variantLabel ?? null,
			},
			update: {
				quantity: clampedQuantity,
				variantLabel: input.variantLabel ?? null,
			},
		});

		return this.getCartByUserId(userId);
	},

	async updateItemQuantity(userId: string, input: UpdateCartItemInput) {
		const safeQuantity = Math.max(0, Math.floor(input.quantity));
		const variantKey = toVariantKey(input.variantId);
		const cart = await this.getOrCreateCart(userId);

		const existing = await prisma.cartItem.findUnique({
			where: {
				cartId_productId_variantKey: {
					cartId: cart.id,
					productId: input.productId,
					variantKey,
				},
			},
			include: { product: true },
		});

		if (!existing) {
			throw new ApiError(404, "Cart item not found.");
		}

		if (safeQuantity <= 0) {
			await prisma.cartItem.delete({ where: { id: existing.id } });
			return this.getCartByUserId(userId);
		}

		const clampedQuantity = Math.min(safeQuantity, Math.max(existing.product.stock, 0));

		await prisma.cartItem.update({
			where: { id: existing.id },
			data: { quantity: clampedQuantity },
		});

		return this.getCartByUserId(userId);
	},

	async removeItem(userId: string, input: { productId: string; variantId?: string | null }) {
		const variantKey = toVariantKey(input.variantId);
		const cart = await this.getOrCreateCart(userId);

		await prisma.cartItem.deleteMany({
			where: {
				cartId: cart.id,
				productId: input.productId,
				variantKey,
			},
		});

		return this.getCartByUserId(userId);
	},

	async clearCart(userId: string) {
		const cart = await this.getOrCreateCart(userId);
		await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
		return this.getCartByUserId(userId);
	},
};
