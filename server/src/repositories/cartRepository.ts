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

type QuoteCartItemInput = {
	productId: string;
	quantity: number;
	variantId?: string | null;
	variantLabel?: string | null;
};

export type CartIdentifier = { userId?: string; guestToken?: string };

function toWhereClause(id: CartIdentifier) {
	if (id.userId) return { userId: id.userId };
	if (id.guestToken) return { guestToken: id.guestToken };
	throw new ApiError(400, "User ID or Guest Token is required.");
}

type QuoteSerializedItem = {
	id: string;
	productId: string;
	slug: string;
	name: string;
	price: number;
	quantity: number;
	stock: number;
	variantId: string | null;
	variantLabel: string | null;
};

const DEFAULT_SHIPPING_FEE = 7.99;

function toVariantKey(variantId?: string | null) {
	return variantId?.trim() || "default";
}

function toTwoDecimals(value: number) {
	return Number(value.toFixed(2));
}

async function getCartRuleConfig() {
	return prisma.cartRuleConfig.upsert({
		where: { id: "default" },
		update: {},
		create: { id: "default" },
	});
}

function toCartResponse(cart: {
	appliedCouponCode: string | null;
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
		couponCode: cart.appliedCouponCode,
	};
}

async function getCouponByCode(code: string, strict: boolean) {
	const normalizedCode = code.trim().toUpperCase();
	if (!normalizedCode) {
		if (strict) {
			throw new ApiError(400, "couponCode is required.");
		}
		return null;
	}

	const coupon = await prisma.coupon.findFirst({
		where: {
			code: normalizedCode,
			isActive: true,
			OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
		},
	});

	if (!coupon && strict) {
		throw new ApiError(400, "Invalid or expired coupon code.");
	}

	return coupon;
}

function toQuoteFromSerialized(
	items: QuoteSerializedItem[],
	rules: {
		minCartValue: { toString(): string } | number;
		maxQuantityPerProduct: number;
		freeShippingThreshold: { toString(): string } | number;
		taxRatePercent: { toString(): string } | number;
		abandonedHours: number;
	},
	couponCode: string | null,
	discountPercent: number
) {
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discount = subtotal * (Math.max(discountPercent, 0) / 100);
	const freeShippingThreshold = Number(rules.freeShippingThreshold);
	const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : DEFAULT_SHIPPING_FEE;
	const taxRatePercent = Number(rules.taxRatePercent);
	const taxBase = Math.max(subtotal - discount + shipping, 0);
	const tax = taxBase * (taxRatePercent / 100);
	const total = Math.max(subtotal - discount + shipping + tax, 0);

	const minCartValue = Number(rules.minCartValue);
	const minCartValueGap = Math.max(minCartValue - subtotal, 0);
	const stockIssues = items
		.filter((item) => item.stock <= 0 || item.quantity > item.stock)
		.map((item) => ({
			productId: item.productId,
			name: item.name,
			requestedQuantity: item.quantity,
			availableStock: item.stock,
		}));

	const quantityIssues = items
		.filter((item) => item.quantity > rules.maxQuantityPerProduct)
		.map((item) => ({
			productId: item.productId,
			name: item.name,
			requestedQuantity: item.quantity,
			maxAllowed: rules.maxQuantityPerProduct,
		}));

	const checkoutAllowed =
		items.length > 0 &&
		minCartValueGap <= 0 &&
		stockIssues.length === 0 &&
		quantityIssues.length === 0;

	return {
		items,
		couponCode,
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

function serializeCartItemsForQuote(cart: {
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
}): QuoteSerializedItem[] {
	return cart.items.map((item) => ({
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
}

export const cartRepository = {
	async getOrCreateCart(id: CartIdentifier) {
		const where = toWhereClause(id);
		return prisma.cart.upsert({
			where,
			create: where,
			update: {},
		});
	},

	async getCart(id: CartIdentifier) {
		const where = toWhereClause(id);
		const cart = await prisma.cart.upsert({
			where,
			create: where,
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

	async addItem(id: CartIdentifier, input: AddCartItemInput) {
		const safeQuantity = Math.max(1, Math.floor(input.quantity || 1));
		const variantKey = toVariantKey(input.variantId);
		const rules = await getCartRuleConfig();

		const product = await prisma.product.findUnique({ where: { id: input.productId } });
		if (!product) {
			throw new ApiError(404, "Product not found.");
		}

		const cart = await this.getOrCreateCart(id);
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

		return this.getCart(id);
	},

	async updateItemQuantity(id: CartIdentifier, input: UpdateCartItemInput) {
		const safeQuantity = Math.max(0, Math.floor(input.quantity));
		const variantKey = toVariantKey(input.variantId);
		const rules = await getCartRuleConfig();
		const cart = await this.getOrCreateCart(id);

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
			return this.getCart(id);
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

		return this.getCart(id);
	},

	async removeItem(id: CartIdentifier, input: { productId: string; variantId?: string | null }) {
		const variantKey = toVariantKey(input.variantId);
		const cart = await this.getOrCreateCart(id);

		await prisma.cartItem.deleteMany({
			where: {
				cartId: cart.id,
				productId: input.productId,
				variantKey,
			},
		});

		return this.getCart(id);
	},

	async clearCart(id: CartIdentifier) {
		const cart = await this.getOrCreateCart(id);
		await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
		await prisma.cart.update({ where: { id: cart.id }, data: { appliedCouponCode: null } });
		return this.getCart(id);
	},

	async applyCoupon(id: CartIdentifier, couponCode: string) {
		const cart = await this.getOrCreateCart(id);
		const coupon = await getCouponByCode(couponCode, true);

		await prisma.cart.update({
			where: { id: cart.id },
			data: { appliedCouponCode: coupon!.code.toUpperCase() },
		});

		return this.getCartQuote(id);
	},

	async removeCoupon(id: CartIdentifier) {
		const cart = await this.getOrCreateCart(id);
		await prisma.cart.update({ where: { id: cart.id }, data: { appliedCouponCode: null } });
		return this.getCartQuote(id);
	},

	async getCartQuote(id: CartIdentifier) {
		const where = toWhereClause(id);
		const [cart, rules] = await Promise.all([
			prisma.cart.upsert({
				where,
				create: where,
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

		const coupon = cart.appliedCouponCode
			? await getCouponByCode(cart.appliedCouponCode, false)
			: null;

		if (!coupon && cart.appliedCouponCode) {
			await prisma.cart.update({ where: { id: cart.id }, data: { appliedCouponCode: null } });
		}

		const serializedItems = serializeCartItemsForQuote(cart);
		return toQuoteFromSerialized(
			serializedItems,
			rules,
			coupon?.code ?? null,
			coupon?.discountPercent ?? 0
		);
	},

	async getGuestCartQuote(items: QuoteCartItemInput[], couponCode?: string) {
		const rules = await getCartRuleConfig();
		const grouped = new Map<string, QuoteCartItemInput>();

		for (const item of items) {
			const key = `${item.productId}::${toVariantKey(item.variantId)}`;
			const existing = grouped.get(key);
			if (existing) {
				existing.quantity += item.quantity;
			} else {
				grouped.set(key, { ...item });
			}
		}

		const entries = Array.from(grouped.values());
		const productIds = entries.map((item) => item.productId);
		const products = productIds.length
			? await prisma.product.findMany({
				where: { id: { in: productIds } },
				select: {
					id: true,
					slug: true,
					name: true,
					price: true,
					stock: true,
				},
			})
			: [];

		const productsById = new Map(products.map((product) => [product.id, product]));
		const serializedItems: QuoteSerializedItem[] = [];

		for (const item of entries) {
			const product = productsById.get(item.productId);
			if (!product) continue;

			const clampedQuantity = Math.min(
				Math.max(1, Math.floor(item.quantity)),
				Math.max(product.stock, 0),
				rules.maxQuantityPerProduct
			);

			if (clampedQuantity <= 0) continue;

			serializedItems.push({
				id: `${item.productId}-${toVariantKey(item.variantId)}`,
				productId: item.productId,
				slug: product.slug,
				name: product.name,
				price: Number(product.price),
				quantity: clampedQuantity,
				stock: product.stock,
				variantId: item.variantId ?? null,
				variantLabel: item.variantLabel ?? null,
			});
		}

		const coupon = couponCode ? await getCouponByCode(couponCode, true) : null;

		return toQuoteFromSerialized(
			serializedItems,
			rules,
			coupon?.code ?? null,
			coupon?.discountPercent ?? 0
		);
	},
};
