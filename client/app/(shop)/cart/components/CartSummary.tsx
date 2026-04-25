"use client";

import Link from "next/link";
import { Clock3, ShieldCheck, TicketPercent, Truck } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";

export function CartSummary() {
  const {
    items,
    totalItems,
    subtotal,
    discountAmount,
    shippingAmount,
    taxAmount,
    total,
    clearCart,
    couponCode,
    checkoutAllowed,
    minCartValueGap,
  } = useCart();

  return (
    <aside className="sticky top-24 grid gap-4">
      <div className="rounded-[26px] border border-[#ffcab8] bg-[linear-gradient(180deg,#fffaf7_0%,#fff2eb_100%)] p-5 shadow-[0_24px_60px_rgba(135,65,24,0.14)]">
        <div className="grid gap-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff5a36]">Summary</p>
          <h2 className="m-0 text-2xl text-[#2f221c]">Order snapshot</h2>
          <p className="m-0 text-sm text-[#8d7567]">Marketplace savings and delivery perks are reflected below.</p>
        </div>

        <div className="mt-4 grid gap-3 rounded-[22px] bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[#8d7567]">Items</span>
            <strong className="text-[#2f221c]">{totalItems}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8d7567]">Subtotal</span>
            <strong className="text-[#2f221c]">{formatPrice(subtotal)}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8d7567]">Discount{couponCode ? ` (${couponCode})` : ""}</span>
            <strong className={discountAmount > 0 ? "text-[#067647]" : "text-[#2f221c]"}>
              -{formatPrice(discountAmount)}
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8d7567]">Shipping</span>
            <strong className="text-[#2f221c]">{shippingAmount === 0 ? "Free" : formatPrice(shippingAmount)}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8d7567]">Tax</span>
            <strong className="text-[#2f221c]">{formatPrice(taxAmount)}</strong>
          </div>
          <div className="h-px bg-[#f2ddd5]" />
          <div className="flex items-end justify-between">
            <div>
              <p className="m-0 text-xs uppercase tracking-[0.14em] text-[#ff5a36]">Total</p>
              <strong className="text-3xl text-[#d9481f]">{formatPrice(total)}</strong>
            </div>
            <span className="rounded-full bg-[#fff1ea] px-3 py-1 text-xs font-semibold text-[#d9481f]">Server quoted</span>
          </div>
        </div>

        {minCartValueGap > 0 ? (
          <p className="mt-3 m-0 rounded-xl border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-sm text-[#b54708]">
            Add {formatPrice(minCartValueGap)} more to meet the minimum cart value for checkout.
          </p>
        ) : null}

        <Link
          href={checkoutAllowed ? "/checkout" : "/products"}
          className={`mt-4 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5a36,#ff7a00)] px-5 py-3.5 text-center text-base font-semibold text-white shadow-[0_16px_32px_rgba(255,106,0,0.24)] ${!checkoutAllowed ? "pointer-events-none opacity-60" : ""}`}
          aria-disabled={!checkoutAllowed}
        >
          Proceed to Checkout
        </Link>

        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[#ffcab8] bg-white px-5 py-3 text-sm font-semibold text-[#8a4c23] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={items.length === 0}
          onClick={() => void clearCart()}
        >
          Clear cart
        </button>
      </div>

      <div className="rounded-[24px] border border-[#ffe0d5] bg-white p-4 shadow-[0_14px_35px_rgba(100,50,20,0.08)]">
        <div className="grid gap-3 text-sm text-[#6f5a50]">
          <div className="flex items-start gap-3">
            <Truck className="mt-0.5 h-4 w-4 text-[#ff5a36]" />
            <span>Free shipping on every cart in this order.</span>
          </div>
          <div className="flex items-start gap-3">
            <TicketPercent className="mt-0.5 h-4 w-4 text-[#ff5a36]" />
            <span>{couponCode ? `Coupon ${couponCode} is active.` : "Apply SAVE10 or MEBA15 for instant savings."}</span>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-[#ff5a36]" />
            <span>Secure checkout backed by buyer protection.</span>
          </div>
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-[#ff5a36]" />
            <span>Popular items can sell out quickly after flash deal updates.</span>
          </div>
        </div>
        <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-[#d9481f]">
          Continue shopping
        </Link>
      </div>
    </aside>
  );
}
