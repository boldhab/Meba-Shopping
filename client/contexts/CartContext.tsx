"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
	addCartItem,
	CartItem,
	CartState,
	clearCart as clearCartApi,
	getCart,
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
	total: number;
	couponCode: string | null;
	error: string | null;
	addItem: (item: CartItem) => Promise<void>;
	updateItemQuantity: (productId: string, variantId: string | undefined, quantity: number) => Promise<void>;
	removeItem: (productId: string, variantId?: string) => Promise<void>;
	clearCart: () => Promise<void>;
	applyCoupon: (code: string) => boolean;
	removeCoupon: () => void;
};

const COUPON_DISCOUNTS: Record<string, number> = {
	SAVE10: 0.1,
	MEBA15: 0.15,
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	const { token } = useAuth();
	const [cartState, setCartState] = useState<CartState>({ items: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [couponCode, setCouponCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const captureCartError = useCallback((reason: unknown) => {
		if (reason instanceof ApiRequestError) {
			setError(reason.message);
			return;
		}

		setError("We couldn't update your cart. Please try again.");
	}, []);

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
	}, [token, captureCartError]);

	const addItem = useCallback(async (item: CartItem) => {
		try {
			setError(null);
			const next = await addCartItem(item, token);
			setCartState(next);
		} catch (reason) {
			captureCartError(reason);
			throw reason;
		}
	}, [token, captureCartError]);

	const updateItemQuantity = useCallback(
		async (productId: string, variantId: string | undefined, quantity: number) => {
			try {
				setError(null);
				const next = await updateCartItemQuantity(productId, variantId, quantity, token);
				setCartState(next);
			} catch (reason) {
				captureCartError(reason);
				throw reason;
			}
		},
		[token, captureCartError]
	);

	const removeItem = useCallback(async (productId: string, variantId?: string) => {
		try {
			setError(null);
			const next = await removeCartItem(productId, variantId, token);
			setCartState(next);
		} catch (reason) {
			captureCartError(reason);
			throw reason;
		}
	}, [token, captureCartError]);

	const clearCart = useCallback(async () => {
		try {
			setError(null);
			const next = await clearCartApi(token);
			setCartState(next);
			setCouponCode(null);
		} catch (reason) {
			captureCartError(reason);
			throw reason;
		}
	}, [token, captureCartError]);

	const applyCoupon = useCallback((code: string) => {
		const normalized = code.trim().toUpperCase();
		if (!normalized || !(normalized in COUPON_DISCOUNTS)) {
			return false;
		}
		setCouponCode(normalized);
		return true;
	}, []);

	const removeCoupon = useCallback(() => {
		setCouponCode(null);
	}, []);

	const totalItems = useMemo(
		() => cartState.items.reduce((sum, item) => sum + item.quantity, 0),
		[cartState.items]
	);

	const subtotal = useMemo(
		() => cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
		[cartState.items]
	);

	const discountRate = couponCode ? COUPON_DISCOUNTS[couponCode] ?? 0 : 0;
	const discountAmount = subtotal * discountRate;
	const total = Math.max(subtotal - discountAmount, 0);

	const value = useMemo<CartContextValue>(
		() => ({
			items: cartState.items,
			isLoading,
			totalItems,
			subtotal,
			discountAmount,
			total,
			couponCode,
			error,
			addItem,
			updateItemQuantity,
			removeItem,
			clearCart,
			applyCoupon,
			removeCoupon,
		}),
		[
			cartState.items,
			isLoading,
			totalItems,
			subtotal,
			discountAmount,
			total,
			couponCode,
			error,
			addItem,
			updateItemQuantity,
			removeItem,
			clearCart,
			applyCoupon,
			removeCoupon,
		]
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
