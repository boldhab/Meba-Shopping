"use client";

import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";

export function CartItems() {
  const { items, isLoading, updateItemQuantity, removeItem, error } = useCart();

  if (isLoading) {
    return <div className="panel">Loading your cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="panel grid gap-3">
        <h2 className="m-0">Your cart is empty</h2>
        <p className="m-0 text-sm text-(--color-muted)">Add products from the catalog to start checkout.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="button inline-flex">
            Browse Products
          </Link>
          <Link href="/" className="button inline-flex bg-transparent text-(--color-text)">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <div className="panel border border-[#fda29b] bg-[#fff6f5] text-[#b42318]">
          {error}
        </div>
      ) : null}

      <div className="panel grid gap-4">
      {items.map((item) => (
        <article
          key={`${item.productId}-${item.variantId ?? "default"}`}
          className="grid gap-4 rounded-[18px] border border-(--color-border) bg-white p-4 md:grid-cols-[112px_1fr]"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-28 w-full rounded-2xl object-cover md:w-28"
          />

          <div className="grid gap-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/products/${item.slug}`} className="font-bold text-(--color-text)">
                  {item.name}
                </Link>
                <p className="m-0 text-[0.85rem] text-(--color-muted)">
                  {item.variantLabel ?? "Standard option"}
                </p>
                <p className="m-0 text-[0.8rem] text-(--color-muted)">
                  {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                </p>
              </div>

              <button
                type="button"
                className="button bg-transparent px-2.5 py-1.5 text-(--color-text)"
                onClick={() => void removeItem(item.productId, item.variantId)}
              >
                Remove
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-(--color-border) px-1.5 py-1">
                <button
                  type="button"
                  className="button px-2.5 py-1"
                  onClick={() => void updateItemQuantity(item.productId, item.variantId, item.quantity - 1)}
                >
                  -
                </button>
                <span className="min-w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  className="button px-2.5 py-1"
                  disabled={item.quantity >= item.stock}
                  onClick={() => void updateItemQuantity(item.productId, item.variantId, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="m-0 font-bold">{formatPrice(item.price * item.quantity)}</p>
                <p className="m-0 text-[0.8rem] text-(--color-muted)">
                  {formatPrice(item.price)} each
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}
