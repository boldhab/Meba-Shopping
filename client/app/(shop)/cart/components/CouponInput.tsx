"use client";

import { useState } from "react";
import { Sparkles, TicketPercent, Check, X } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { useToast } from "@/contexts/ToastContext";

export function CouponInput() {
  const { couponCode, applyCoupon, removeCoupon, error: cartError } = useCart();
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onApply = async () => {
    if (!value.trim() || isApplying) return;
    setIsApplying(true);
    setError(null);

    const success = await applyCoupon(value);
    setIsApplying(false);

    if (success) {
      toast.success(`Coupon code ${value.toUpperCase()} applied!`, { title: "Discount Applied" });
      setValue("");
    } else {
      setError(cartError || "Invalid or expired coupon. Try WELCOME10, MEBA15, or SUPERDEAL.");
    }
  };

  const handleRemove = async () => {
    await removeCoupon();
    toast.info("Coupon removed.");
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
            <TicketPercent className="h-4 w-4" />
            Promo Code
          </div>
          <h3 className="m-0 text-base font-bold text-slate-900">Add Discount Coupon</h3>
          <p className="m-0 text-xs text-slate-500">
            Use <span className="font-semibold text-slate-700">WELCOME10</span>, <span className="font-semibold text-slate-700">MEBA15</span>, or <span className="font-semibold text-slate-700">SUPERDEAL</span> to save.
          </p>
        </div>

        <div className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 border border-orange-100 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          Instant Discount
        </div>
      </div>

      {couponCode ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <p className="m-0 text-sm font-semibold text-emerald-900">
              Coupon <span className="font-bold uppercase tracking-wide">{couponCode}</span> active
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-white transition-colors"
            onClick={handleRemove}
          >
            <X className="w-3.5 h-3.5" />
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all uppercase font-medium"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="ENTER CODE"
          />
          <button
            type="button"
            disabled={isApplying || !value.trim()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
            onClick={onApply}
          >
            {isApplying ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Apply"
            )}
          </button>
        </div>
      )}

      {error ? <p className="mt-2.5 m-0 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}
