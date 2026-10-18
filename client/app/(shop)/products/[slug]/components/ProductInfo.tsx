import { Flame, Calendar, Tag, Sparkles } from "lucide-react";
import { type DealType } from "@/lib/api/products";
import { formatPrice } from "@/lib/utils/formatPrice";

const dealConfig: Record<DealType, { label: string; icon: typeof Flame; badgeClass: string }> = {
  DAILY: {
    label: "Daily Deal",
    icon: Flame,
    badgeClass: "bg-orange-500 text-white",
  },
  WEEKLY: {
    label: "Weekly Deal",
    icon: Calendar,
    badgeClass: "bg-blue-600 text-white",
  },
  CLEARANCE: {
    label: "Clearance Deal",
    icon: Tag,
    badgeClass: "bg-rose-600 text-white",
  },
  CEREMONY: {
    label: "Celebration Deal",
    icon: Sparkles,
    badgeClass: "bg-purple-600 text-white",
  },
};

export function ProductInfo({
  description,
  price,
  compareAtPrice,
  discountPercent,
  dealType,
  isDealActive,
  stock,
  reviewCount,
}: {
  description: string | null;
  price: string;
  compareAtPrice?: string | number | null;
  discountPercent?: number | null;
  dealType?: DealType | null;
  isDealActive?: boolean;
  stock: number;
  reviewCount: number;
}) {
  const isInStock = stock > 0;
  const currentPrice = Number(price);
  const originalPrice = compareAtPrice ? Number(compareAtPrice) : null;
  const hasDiscount = originalPrice !== null && originalPrice > currentPrice;
  const savings = hasDiscount ? originalPrice - currentPrice : 0;
  const computedPercent = discountPercent ?? (hasDiscount ? Math.round((savings / originalPrice) * 100) : 0);
  const activeDeal = isDealActive && dealType ? dealConfig[dealType] : null;

  return (
    <section className="space-y-4 pt-2">
      {/* Price Header */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Supermarket Price
          </span>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-base sm:text-lg text-slate-400 line-through font-semibold">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-xs font-bold text-emerald-600 mt-1">
              You save {formatPrice(savings)} ({computedPercent}% off)
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {activeDeal && (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs ${activeDeal.badgeClass}`}>
              <activeDeal.icon className="w-3.5 h-3.5" />
              {activeDeal.label}
            </span>
          )}
          {computedPercent > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
              Save {computedPercent}%
            </span>
          )}
        </div>
      </div>

      {/* Meta Highlights Row */}
      <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <strong className="block text-slate-900 font-bold">{isInStock ? "In Stock" : "Sold Out"}</strong>
          <span className="text-[11px] text-slate-500">{isInStock ? `${stock} units ready` : "Check back"}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <strong className="block text-slate-900 font-bold">{reviewCount > 0 ? `${reviewCount} Reviews` : "New Item"}</strong>
          <span className="text-[11px] text-slate-500">{reviewCount > 0 ? "Verified feedback" : "Be the first"}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <strong className="block text-slate-900 font-bold">Guarantee</strong>
          <span className="text-[11px] text-slate-500">7-day fresh refund</span>
        </div>
      </div>

      {/* Description & Specifications Box */}
      <div className="space-y-3 pt-2 text-xs text-slate-600 leading-relaxed">
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
            Product Description
          </h4>
          <p className="text-slate-600 font-normal">
            {description ?? "Premium authentic grocery item freshly packaged with full quality guarantee from Meba Supermarket."}
          </p>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3 bg-white">
          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Condition</span>
            <span className="text-slate-900 font-semibold">100% Brand New &amp; Sealed</span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Fulfillment</span>
            <span className="text-slate-900 font-semibold">Addis Ababa Warehouse Hub</span>
          </div>
          <div className="py-2 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Payments</span>
            <span className="text-slate-900 font-semibold">Telebirr, CBE Birr, Card, Cash</span>
          </div>
        </div>
      </div>
    </section>
  );
}
