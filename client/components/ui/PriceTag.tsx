import React from "react";

export type PriceTagProps = {
  value?: number | string;
  originalPrice?: number | string;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "text-sm",
  md: "text-base font-semibold",
  lg: "text-xl font-bold",
  xl: "text-2xl lg:text-3xl font-extrabold",
};

const originalSizeClasses = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

function formatCurrencyAmount(amount: number, currency: string) {
  if (currency.toUpperCase() === "ETB") {
    return `${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function PriceTag({
  value = 0,
  originalPrice,
  currency = "ETB",
  size = "md",
  className = "",
}: PriceTagProps) {
  const currentNum = typeof value === "string" ? parseFloat(value) || 0 : value;
  const originalNum =
    typeof originalPrice === "string"
      ? parseFloat(originalPrice) || 0
      : originalPrice;

  const hasDiscount = originalNum && originalNum > currentNum;
  const discountPercent = hasDiscount
    ? Math.round(((originalNum - currentNum) / originalNum) * 100)
    : 0;

  return (
    <div className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={`text-slate-900 tracking-tight ${sizeClasses[size]}`}>
        {formatCurrencyAmount(currentNum, currency)}
      </span>

      {hasDiscount && (
        <>
          <span
            className={`text-slate-400 line-through ${originalSizeClasses[size]}`}
          >
            {formatCurrencyAmount(originalNum, currency)}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
