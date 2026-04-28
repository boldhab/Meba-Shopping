"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
	addCartItem,
	CartItem,
	CartQuote,
	CartState,
	clearCart as clearCartApi,
	getCart,
	getCartQuote,
	mergeGuestCartToServer,
	removeCartItem,
	updateCartItemQuantity,
} from "@/lib/api/cart";
import { ApiRequestError } from "@/lib/api/client";
import { useAuth } from "@/lib/hooks/useAuth";

type CartContextValue = {
	items: CartItem[];
	isLoading: boolean;
	totalItems: number;
	subtotal: number;
	discountAmount: number;
	shippingAmount: number;
	taxAmount: number;
	total: number;
	couponCode: string | null;
	checkoutAllowed: boolean;
	minCartValueGap: number;
	error: string | null;
	addItem: (item: CartItem) => Promise<void>;
	updateItemQuantity: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
	removeItem: (productId: string, variantId?: string) => Promise<void>;
	clearCart: () => Promise<void>;
	refreshQuote: () => Promise<void>;
	applyCoupon: (code: string) => boolean;
	removeCoupon: () => void;
};

const COUPON_DISCOUNTS: Record<string, number> = {
	SAVE10: 0.1,
	MEBA15: 0.15,
};

const GUEST_FREE_SHIPPING_THRESHOLD = 50;

function buildGuestQuote(items: CartItem[], couponCode: string | null): CartQuote {
	const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	const discountRate = couponCode ? COUPON_DISCOUNTS[couponCode] ?? 0 : 0;
	const discount = subtotal * discountRate;
	const shipping = subtotal > 0 && subtotal < GUEST_FREE_SHIPPING_THRESHOLD ? 7.99 : 0;
	const tax = 0;
	const total = Math.max(subtotal - discount + shipping + tax, 0);

	return {
		items: items.map((item) => ({
			id: `${item.productId}-${item.variantId ?? "default"}`,
			...item,
		})),
		couponCode,
		totals: {
			subtotal,
			discount,
			shipping,
			tax,
			total,
		},
		rules: {
			minCartValue: 0,
			maxQuantityPerProduct: 999,
			freeShippingThreshold: GUEST_FREE_SHIPPING_THRESHOLD,
			taxRatePercent: 0,
			abandonedHours: 24,
		},
		validation: {
			minCartValueGap: 0,
			meetsMinimumCartValue: true,
			stockIssues: [],
			quantityIssues: [],
			checkoutAllowed: items.length > 0,
		},
	};
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const { token } = useAuth();
	const [cartState, setCartState] = useState<CartState>({ items: [] });
	const [cartQuote, setCartQuote] = useState<CartQuote | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [couponCode, setCouponCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isQuoteLoading, setIsQuoteLoading] = useState(false);

	const captureCartError = useCallback((reason: unknown) => {
		if (reason instanceof ApiRequestError) {
			setError(reason.message);
			return;
		}

		setError("We couldn't update your cart. Please try again.");
	}, []);

	const refreshQuote = useCallback(async (nextCartState?: CartState) => {
		const source = nextCartState ?? cartState;

		if (!token) {
			setCartQuote(buildGuestQuote(source.items, couponCode));
			return;
		}

		setIsQuoteLoading(true);
		try {
			const nextQuote = await getCartQuote(token);
			setCartQuote(nextQuote);
		} catch (reason) {
			captureCartError(reason);
		} finally {
			setIsQuoteLoading(false);
		}
	}, [token, cartState, couponCode, captureCartError]);

	useEffect(() => {
		let mounted = true;

		async function loadCart() {
			setIsLoading(true);
			setError(null);

			try {
				const next = token
					? await mergeGuestCartToServer(token)
					: await getCart();

				if (!mounted) return;
				setCartState(next);
				if (token) {
					const quote = await getCartQuote(token);
					if (!mounted) return;
					setCartQuote(quote);
				} else {
					setCartQuote(buildGuestQuote(next.items, couponCode));
				}
			} catch (reason) {
				if (mounted) {
					captureCartError(reason);
				}
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		}

		void loadCart();

		return () => {
			mounted = false;
		};
	}, [token, couponCode, captureCartError]);

	const addItem = useCallback(async (item: CartItem) => {
		try {
			setError(null);
			const next = await addCartItem(item, token);
			setCartState(next);
			await refreshQuote(next);
		} catch (reason) {
			captureCartError(reason);
			throw reason;
		}
	}, [token, captureCartError, refreshQuote]);

	const updateItemQuantity = useCallback(
		async (productId: string, variantId: string | undefined, quantity: number) => {
			try {
				setError(null);
				const next = await updateCartItemQuantity(productId, variantId, quantity, token);
				setCartState(next);
				await refreshQuote(next);
			} catch (reason) {
				captureCartError(reason);
				throw reason;
			}
		},
		[token, captureCartError, refreshQuote]
	);

	const removeItem = useCallback(async (productId: string, variantId?: string) => {
		try {
			setError(null);
			const next = await removeCartItem(productId, variantId, token);
			setCartState(next);
			await refreshQuote(next);
		} catch (reason) {
			captureCartError(reason);
			throw reason;
		}
	}, [token, captureCartError, refreshQuote]);

	const clearCart = useCallback(async () => {
		try {
			setError(null);
			const next = await clearCartApi(token);
			setCartState(next);
			setCouponCode(null);
			await refreshQuote(next);
		} catch (reason) {
			captureCartError(reason);
			throw reason;
		}
	}, [token, captureCartError, refreshQuote]);

	const applyCoupon = useCallback((code: string) => {
		if (token) {
			setError("Backend coupon validation is not available yet.");
			return false;
		}

		const normalized = code.trim().toUpperCase();
		if (!normalized || !(normalized in COUPON_DISCOUNTS)) {
			return false;
		}
		setCouponCode(normalized);
		return true;
	}, [token]);

	const removeCoupon = useCallback(() => {
		if (token) {
			setError("Backend coupon validation is not available yet.");
			return;
		}

		setCouponCode(null);
	}, [token]);

	useEffect(() => {
		if (!token) {
			setCartQuote(buildGuestQuote(cartState.items, couponCode));
		}
	}, [token, cartState.items, couponCode]);

	const totalItems = useMemo(
		() => cartState.items.reduce((sum, item) => sum + item.quantity, 0),
		[cartState.items]
	);

	const subtotal = cartQuote?.totals.subtotal ?? 0;
	const discountAmount = cartQuote?.totals.discount ?? 0;
	const shippingAmount = cartQuote?.totals.shipping ?? 0;
	const taxAmount = cartQuote?.totals.tax ?? 0;
	const total = cartQuote?.totals.total ?? 0;
	const minCartValueGap = cartQuote?.validation.minCartValueGap ?? 0;
	const checkoutAllowed = cartQuote?.validation.checkoutAllowed ?? cartState.items.length > 0;

	const value = useMemo<CartContextValue>(
		() => ({
			items: cartState.items,
			isLoading: isLoading || isQuoteLoading,
			totalItems,
			subtotal,
			discountAmount,
			shippingAmount,
			taxAmount,
			total,
			couponCode,
			checkoutAllowed,
			minCartValueGap,
			error,
			addItem,
			updateItemQuantity,
			removeItem,
			clearCart,
			refreshQuote: async () => {
				await refreshQuote();
			},
			applyCoupon,
			removeCoupon,
		}),
		[
			cartState.items,
			isLoading,
			isQuoteLoading,
			totalItems,
			subtotal,
			discountAmount,
			shippingAmount,
			taxAmount,
			total,
			couponCode,
			checkoutAllowed,
			minCartValueGap,
			error,
			addItem,
			updateItemQuantity,
			removeItem,
			clearCart,
			refreshQuote,
			applyCoupon,
			removeCoupon,
		]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
