"use client";

import Link from "next/link";
import { useCart } from "@/lib/hooks/useCart";

export function CartItems() {
  const { items, isLoading, updateItemQuantity, removeItem } = useCart();

  if (isLoading) {
    return <div className="panel">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="panel">
        <h2>Your cart is empty</h2>
        <p>Add products from the catalog to start checkout.</p>
        <Link href="/products" className="button mt-3 inline-flex">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="panel grid gap-4">
      {items.map((item) => (
        <article
          key={`${item.productId}-${item.variantId ?? "default"}`}
          className="grid grid-cols-[96px_1fr] gap-4 rounded-[14px] border border-(--color-border) bg-white p-3.5"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-24 w-24 rounded-xl object-cover"
          />

          <div className="grid gap-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/products/${item.slug}`} className="font-bold">
                  {item.name}
                </Link>
                <p className="m-0 text-[0.85rem] text-(--color-muted)">
                  {item.variantLabel ?? "Standard option"}
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
              <div className="inline-flex items-center gap-1.5">
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
                  onClick={() => void updateItemQuantity(item.productId, item.variantId, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="m-0 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                <p className="m-0 text-[0.8rem] text-(--color-muted)">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
