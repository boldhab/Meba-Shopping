"use client";

import { useCart } from "@/lib/hooks/useCart";

export function CartSummary() {
  const { items, totalItems, subtotal, discountAmount, total, clearCart } = useCart();
  const shipping: number = items.length > 0 ? 0 : 0;

  return (
    <aside className="panel grid gap-3">
      <h2 className="m-0">Order summary</h2>

      <div className="grid gap-1.5 text-(--color-muted)">
        <div className="flex justify-between">
          <span>Items</span>
          <strong className="text-(--color-text)">{totalItems}</strong>
        </div>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <strong className="text-(--color-text)">${subtotal.toFixed(2)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <strong className={discountAmount > 0 ? "text-[#067647]" : "text-(--color-text)"}>
            -${discountAmount.toFixed(2)}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <strong className="text-(--color-text)">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong>
        </div>
      </div>

      <hr className="my-1 border-0 border-t border-(--color-border)" />

      <div className="flex items-center justify-between">
        <span className="font-semibold">Total</span>
        <strong className="text-[1.1rem]">${(total + shipping).toFixed(2)}</strong>
      </div>

      <button type="button" className="button" disabled={items.length === 0}>
        Proceed to Checkout
      </button>
      <button
        type="button"
        className="button bg-transparent text-(--color-text)"
        disabled={items.length === 0}
        onClick={() => void clearCart()}
      >
        Clear cart
      </button>
    </aside>
  );
}
