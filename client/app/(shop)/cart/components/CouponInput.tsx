"use client";

import { useState } from "react";
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
    <div className="panel grid gap-2.5">
      <h2 className="m-0">Coupon</h2>

      {couponCode ? (
        <div className="flex items-center justify-between gap-3">
          <p className="m-0">
            Applied code: <strong>{couponCode}</strong>
          </p>
          <button type="button" className="button" onClick={removeCoupon}>
            Remove
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <input
            className="input min-w-55 flex-1"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter coupon code"
          />
          <button type="button" className="button" onClick={onApply}>
            Apply
          </button>
        </div>
      )}

      {error ? <p className="m-0 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}
