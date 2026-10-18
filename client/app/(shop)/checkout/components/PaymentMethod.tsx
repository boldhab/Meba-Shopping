"use client";

import React from "react";
import { CreditCard, Smartphone, Banknote, ShieldCheck } from "lucide-react";

export type PaymentMethodType = "card" | "mobile" | "cod";

export type PaymentMethodProps = {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  mobileNumber?: string;
  onMobileNumberChange?: (val: string) => void;
  mobileProvider?: "telebirr" | "cbebirr";
  onMobileProviderChange?: (val: "telebirr" | "cbebirr") => void;
};

export function PaymentMethod({
  selectedMethod,
  onSelectMethod,
  mobileNumber = "",
  onMobileNumberChange,
  mobileProvider = "telebirr",
  onMobileProviderChange,
}: PaymentMethodProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
          <p className="text-xs text-slate-500 mt-0.5">Choose how you want to pay for your order</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Secure checkout
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Card Option */}
        <button
          type="button"
          onClick={() => onSelectMethod("card")}
          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMethod === "card"
              ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-900">Credit / Debit Card</span>
          <span className="text-xs text-slate-500 mt-1">Visa, Mastercard, Stripe</span>
        </button>

        {/* Mobile Money Option */}
        <button
          type="button"
          onClick={() => onSelectMethod("mobile")}
          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMethod === "mobile"
              ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-100"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-900">Mobile Money</span>
          <span className="text-xs text-slate-500 mt-1">Telebirr & CBE Birr</span>
        </button>

        {/* Cash on Delivery Option */}
        <button
          type="button"
          onClick={() => onSelectMethod("cod")}
          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedMethod === "cod"
              ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-100"
              : "border-slate-200 hover:border-slate-300 bg-white"
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
            <Banknote className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-900">Cash on Delivery</span>
          <span className="text-xs text-slate-500 mt-1">Pay when order arrives</span>
        </button>
      </div>

      {/* Sub-view for Mobile Money */}
      {selectedMethod === "mobile" && (
        <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-100 space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-700">Select Provider:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onMobileProviderChange?.("telebirr")}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  mobileProvider === "telebirr"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                Telebirr
              </button>
              <button
                type="button"
                onClick={() => onMobileProviderChange?.("cbebirr")}
                className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                  mobileProvider === "cbebirr"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                CBE Birr
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="mobile-account-number">
              {mobileProvider === "telebirr" ? "Telebirr Mobile Number" : "CBE Birr Account / Phone"}
            </label>
            <input
              id="mobile-account-number"
              type="tel"
              value={mobileNumber}
              onChange={(e) => onMobileNumberChange?.(e.target.value)}
              placeholder="e.g. 0911 234 567"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              After placing your order, an instant USSD prompt or payment reference code will be generated.
            </p>
          </div>
        </div>
      )}

      {/* Sub-view for Cash on Delivery */}
      {selectedMethod === "cod" && (
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <p className="text-xs font-semibold text-emerald-900">
            💵 You will pay the courier in cash or via mobile POS when your package is delivered to your doorstep.
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">
            Please make sure someone is available at your delivery address to receive the items.
          </p>
        </div>
      )}

      {/* Sub-view for Card */}
      {selectedMethod === "card" && (
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
          <p className="text-xs font-semibold text-blue-900">
            🔒 Secure 256-bit encrypted card processing via Stripe.
          </p>
          <p className="text-[11px] text-blue-700 mt-1">
            You will enter your card details on the next step once shipping information is confirmed.
          </p>
        </div>
      )}
    </div>
  );
}
