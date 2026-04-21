"use client";

import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";

export function CartSummary() {
  const { items, totalItems, subtotal, discountAmount, total, clearCart, couponCode } = useCart();
  const shipping: number = items.length > 0 ? 0 : 0;

  return (
    <aside className="panel sticky top-24 grid gap-4">
      <div className="grid gap-1">
        <h2 className="m-0">Order summary</h2>
        <p className="m-0 text-sm text-(--color-muted)">Everything is updated instantly as you edit your cart.</p>
      </div>

      <div className="grid gap-1.5 text-(--color-muted)">
        <div className="flex justify-between">
          <span>Items</span>
          <strong className="text-(--color-text)">{totalItems}</strong>
        </div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <strong className="text-(--color-text)">{formatPrice(subtotal)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
          <strong className={discountAmount > 0 ? "text-[#067647]" : "text-(--color-text)"}>
            -{formatPrice(discountAmount)}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <strong className="text-(--color-text)">{shipping === 0 ? "Free" : formatPrice(shipping)}</strong>
        </div>
      </div>

      <hr className="my-1 border-0 border-t border-(--color-border)" />

      <div className="flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <strong className="text-[1.1rem]">{formatPrice(total + shipping)}</strong>
      </div>

      <Link
        href={items.length === 0 ? "/products" : "/checkout"}
        className={`button text-center ${items.length === 0 ? "pointer-events-none opacity-60" : ""}`}
        aria-disabled={items.length === 0}
      >
        Proceed to Checkout
      </Link>
      <button
        type="button"
        className="button bg-transparent text-(--color-text)"
        disabled={items.length === 0}
        onClick={() => void clearCart()}
      >
        Clear cart
      </button>
      <Link href="/products" className="text-sm font-medium text-(--color-text)">
        Continue shopping
      </Link>
    </aside>
  );
}
