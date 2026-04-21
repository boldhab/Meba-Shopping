"use client";

import Link from "next/link";
import { ShieldCheck, Store, Trash2, Truck } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";

export function CartItems() {
  const { items, isLoading, updateItemQuantity, removeItem, error } = useCart();

  if (isLoading) {
    return <div className="panel">Loading your cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="panel grid gap-4 rounded-[24px] border border-[#ffe0d5] bg-[linear-gradient(180deg,#fffaf7_0%,#fff3ee_100%)]">
        <div className="grid gap-1">
          <h2 className="m-0 text-2xl">Your cart is empty</h2>
          <p className="m-0 text-sm text-(--color-muted)">Browse the marketplace and add a few deals to get started.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5a36,#ff7a00)] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(255,106,0,0.2)]">
            Browse Products
          </Link>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-[#ffb39f] bg-white px-5 py-3 font-semibold text-[#d9481f]">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {error ? (
        <div className="rounded-[22px] border border-[#fda29b] bg-[#fff6f5] px-4 py-3 text-[#b42318] shadow-[0_10px_25px_rgba(180,35,24,0.08)]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4">
      {items.map((item) => (
        <article
          key={`${item.productId}-${item.variantId ?? "default"}`}
          className="grid gap-4 overflow-hidden rounded-[24px] border border-[#ffd9cf] bg-[linear-gradient(180deg,#ffffff_0%,#fff8f5_100%)] p-4 shadow-[0_16px_40px_rgba(135,65,24,0.08)] md:grid-cols-[128px_1fr]"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-32 w-full rounded-[20px] object-cover md:w-32"
          />

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ff5a36]">
              <span className="rounded-full bg-[#fff1ea] px-2.5 py-1">Choice</span>
              <span className="rounded-full bg-[#fff1ea] px-2.5 py-1">Fast deal</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="grid gap-1">
                <Link href={`/products/${item.slug}`} className="font-bold text-(--color-text) hover:text-[#d9481f]">
                  {item.name}
                </Link>
                <p className="m-0 flex items-center gap-1.5 text-[0.83rem] text-(--color-muted)">
                  <Store className="h-3.5 w-3.5 text-[#ff5a36]" />
                  Meba Global Store
                </p>
                <p className="m-0 text-[0.85rem] text-(--color-muted)">
                  {item.variantLabel ?? "Standard option"}
                </p>
                <p className="m-0 flex items-center gap-1.5 text-[0.8rem] text-(--color-muted)">
                  <Truck className="h-3.5 w-3.5 text-[#ff5a36]" />
                  {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-[#ffd2c7] bg-white px-3 py-2 text-sm font-medium text-[#a14c2f]"
                onClick={() => void removeItem(item.productId, item.variantId)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8d7567]">
              <span className="rounded-full bg-[#fff3cf] px-3 py-1 font-semibold text-[#9a6700]">
                Save {formatPrice(item.price * 0.08)} today
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#eefaf3] px-3 py-1 font-medium text-[#027a48]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Buyer protection
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ffd2c7] bg-white px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3ee] text-lg font-semibold text-[#d9481f]"
                  onClick={() => void updateItemQuantity(item.productId, item.variantId, item.quantity - 1)}
                >
                  -
                </button>
                <span className="min-w-10 text-center font-semibold text-[#2f221c]">{item.quantity}</span>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3ee] text-lg font-semibold text-[#d9481f] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={item.quantity >= item.stock}
                  onClick={() => void updateItemQuantity(item.productId, item.variantId, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#ff5a36]">Price</p>
                <p className="m-0 text-2xl font-bold text-[#d9481f]">{formatPrice(item.price * item.quantity)}</p>
                <p className="m-0 text-[0.8rem] text-(--color-muted)">{formatPrice(item.price)} each</p>
              </div>
            </div>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}
