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

const DEFAULT_SHIPPING_FEE = 7.99;

async function getCartRuleConfig() {
	return prisma.cartRuleConfig.upsert({
		where: { id: "default" },
		update: {},
		create: { id: "default" },
	});
}

function toTwoDecimals(value: number) {
	return Number(value.toFixed(2));
}

function toCartQuoteResponse(
	cart: {
		items: Array<{
			id: string;
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
	},
	rules: {
		minCartValue: { toString(): string } | number;
		maxQuantityPerProduct: number;
		freeShippingThreshold: { toString(): string } | number;
		taxRatePercent: { toString(): string } | number;
		abandonedHours: number;
	}
) {
	const serializedItems = cart.items.map((item) => ({
		id: item.id,
		productId: item.productId,
		slug: item.product.slug,
		name: item.product.name,
		price: Number(item.product.price),
		quantity: item.quantity,
		stock: item.product.stock,
		variantId: item.variantId,
		variantLabel: item.variantLabel,
	}));

	const subtotal = serializedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discount = 0;
	const freeShippingThreshold = Number(rules.freeShippingThreshold);
	const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : DEFAULT_SHIPPING_FEE;
	const taxRatePercent = Number(rules.taxRatePercent);
	const taxBase = Math.max(subtotal - discount + shipping, 0);
	const tax = taxBase * (taxRatePercent / 100);
	const total = Math.max(subtotal - discount + shipping + tax, 0);

	const minCartValue = Number(rules.minCartValue);
	const minCartValueGap = Math.max(minCartValue - subtotal, 0);
	const stockIssues = serializedItems
		.filter((item) => item.stock <= 0 || item.quantity > item.stock)
		.map((item) => ({
			productId: item.productId,
			name: item.name,
			requestedQuantity: item.quantity,
			availableStock: item.stock,
		}));

	const quantityIssues = serializedItems
		.filter((item) => item.quantity > rules.maxQuantityPerProduct)
		.map((item) => ({
			productId: item.productId,
			name: item.name,
			requestedQuantity: item.quantity,
			maxAllowed: rules.maxQuantityPerProduct,
		}));

	const checkoutAllowed =
		serializedItems.length > 0 &&
		minCartValueGap <= 0 &&
		stockIssues.length === 0 &&
		quantityIssues.length === 0;

	return {
		items: serializedItems,
		totals: {
			subtotal: toTwoDecimals(subtotal),
			discount: toTwoDecimals(discount),
			shipping: toTwoDecimals(shipping),
			tax: toTwoDecimals(tax),
			total: toTwoDecimals(total),
		},
		rules: {
			minCartValue,
			maxQuantityPerProduct: rules.maxQuantityPerProduct,
			freeShippingThreshold,
			taxRatePercent,
			abandonedHours: rules.abandonedHours,
		},
		validation: {
			minCartValueGap: toTwoDecimals(minCartValueGap),
			meetsMinimumCartValue: minCartValueGap <= 0,
			stockIssues,
			quantityIssues,
			checkoutAllowed,
		},
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
		const rules = await getCartRuleConfig();

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
		const clampedQuantity = Math.min(
			requestedQuantity,
			Math.max(product.stock, 0),
			rules.maxQuantityPerProduct
		);

		if (clampedQuantity <= 0) {
			throw new ApiError(400, "Product is currently out of stock.");
		}

		if (existing && existing.quantity >= rules.maxQuantityPerProduct && requestedQuantity > existing.quantity) {
			throw new ApiError(400, `Maximum quantity per product is ${rules.maxQuantityPerProduct}.`);
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
		const rules = await getCartRuleConfig();
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

		const clampedQuantity = Math.min(
			safeQuantity,
			Math.max(existing.product.stock, 0),
			rules.maxQuantityPerProduct
		);

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

	async getCartQuote(userId: string) {
		const [cart, rules] = await Promise.all([
			prisma.cart.upsert({
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
			}),
			getCartRuleConfig(),
		]);

		return toCartQuoteResponse(cart, rules);
	},
};
