"use client";

import { useState } from "react";
import { Sparkles, TicketPercent } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";

export function CouponInput() {
  const { couponCode, applyCoupon, removeCoupon } = useCart();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onApply = () => {
    if (!value.trim()) return;
    const success = applyCoupon(value);
    if (!success) {
      setError("Invalid coupon. Try SAVE10 or MEBA15.");
      return;
    }
    setError(null);
    setValue("");
  };

  return (
    <div className="rounded-[24px] border border-[#ffd9cf] bg-[linear-gradient(180deg,#fffaf8_0%,#fff3ee_100%)] p-5 shadow-[0_14px_35px_rgba(125,65,24,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff5a36]">
            <TicketPercent className="h-4 w-4" />
            Coupons
          </div>
          <h2 className="m-0 text-xl text-[#2f221c]">Marketplace discount center</h2>
          <p className="m-0 text-sm text-[#8d7567]">Try `SAVE10` or `MEBA15` to unlock instant order savings.</p>
        </div>

        <div className="rounded-full bg-[#fff1ea] px-3 py-2 text-xs font-semibold text-[#d9481f]">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          Stack savings before checkout
        </div>
      </div>

      {couponCode ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white p-4">
          <p className="m-0 text-sm text-[#6f5a50]">
            Applied code: <strong className="text-[#d9481f]">{couponCode}</strong>
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-[#ffcab8] bg-white px-4 py-2 text-sm font-semibold text-[#a14c2f]"
            onClick={removeCoupon}
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            className="min-w-55 flex-1 rounded-full border border-[#ffd2c7] bg-white px-4 py-3 outline-none ring-0"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter coupon code"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5a36,#ff7a00)] px-5 py-3 font-semibold text-white shadow-[0_14px_30px_rgba(255,106,0,0.18)]"
            onClick={onApply}
          >
            Apply
          </button>
        </div>
      )}

      {error ? <p className="mt-3 m-0 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}
