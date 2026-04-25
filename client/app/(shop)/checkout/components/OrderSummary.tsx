"use client";

import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";

export function OrderSummary() {
  const {
    items,
    totalItems,
    subtotal,
    total,
    discountAmount,
    couponCode,
    shippingAmount,
    taxAmount,
    minCartValueGap,
    checkoutAllowed,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="panel grid gap-3">
        <h2 className="m-0">No items ready for checkout</h2>
        <p className="m-0 text-sm text-(--color-muted)">Your cart is empty, so there is nothing to place yet.</p>
        <Link href="/products" className="button inline-flex w-fit">
          Browse Products
        </Link>
      </div>
    );
  }

  if (!checkoutAllowed) {
    return (
      <div className="panel grid gap-3">
        <h2 className="m-0">Checkout requirements not met</h2>
        <p className="m-0 text-sm text-(--color-muted)">
          Add {formatPrice(minCartValueGap)} more to meet the minimum checkout amount.
        </p>
        <Link href="/cart" className="button inline-flex w-fit">
          Back to Cart
        </Link>
      </div>
    );
  }

  return (
    <aside className="panel grid gap-4">
      <div>
        <h2 className="m-0">Order summary</h2>
        <p className="m-0 text-sm text-(--color-muted)">{totalItems} item(s) ready for checkout.</p>
      </div>

      <div className="grid gap-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId ?? "default"}`} className="flex items-start justify-between gap-3">
            <div>
              <p className="m-0 font-medium">{item.name}</p>
              <p className="m-0 text-sm text-(--color-muted)">
                {item.variantLabel ?? "Standard option"} x {item.quantity}
              </p>
            </div>
            <strong>{formatPrice(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <hr className="border-0 border-t border-(--color-border)" />

      <div className="grid gap-1.5 text-sm text-(--color-muted)">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <strong className="text-(--color-text)">{formatPrice(subtotal)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Discount{couponCode ? ` (${couponCode})` : ""}</span>
          <strong className="text-(--color-text)">-{formatPrice(discountAmount)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <strong className="text-(--color-text)">{shippingAmount === 0 ? "Free" : formatPrice(shippingAmount)}</strong>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <strong className="text-(--color-text)">{formatPrice(taxAmount)}</strong>
        </div>
      </div>

      <div className="flex items-center justify-between text-base">
        <span className="font-semibold">Total</span>
        <strong>{formatPrice(total)}</strong>
      </div>
    </aside>
  );
}
