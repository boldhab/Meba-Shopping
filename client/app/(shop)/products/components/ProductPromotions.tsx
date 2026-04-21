"use client";

import Link from "next/link";
import { DealType, Product } from "@/lib/api/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { Flame } from "lucide-react";

export const DEAL_TYPE_LABELS: Record<DealType, string> = {
  DAILY: "Daily Deals",
  WEEKLY: "Weekly Deals",
  CLEARANCE: "Clearance Deals",
  CEREMONY: "Ceremony Deals",
};

const DEAL_TYPE_DESCRIPTIONS: Record<DealType, string> = {
  DAILY: "Short-window offers refreshed for today.",
  WEEKLY: "Longer-running bargains to keep an eye on all week.",
  CLEARANCE: "Limited stock markdowns before items are gone.",
  CEREMONY: "Seasonal and celebration-ready offers for special moments.",
};

const DEFAULT_DISPLAY_ORDER: DealType[] = ["DAILY", "CEREMONY", "WEEKLY", "CLEARANCE"];

function groupDealsByType(products: Product[]) {
  return products.reduce<Record<DealType, Product[]>>(
    (acc, product) => {
      if (!product.dealType) {
        return acc;
      }

      acc[product.dealType].push(product);
      return acc;
    },
    {
      DAILY: [],
      WEEKLY: [],
      CLEARANCE: [],
      CEREMONY: [],
    }
  );
}

function getDisplayOrder(selectedDealType?: DealType) {
  if (!selectedDealType) {
    return DEFAULT_DISPLAY_ORDER;
  }

  return [
    selectedDealType,
    ...DEFAULT_DISPLAY_ORDER.filter((dealType) => dealType !== selectedDealType),
  ];
}

export function ProductPromotions({
  products,
  selectedDealType,
  showEmptySections = false,
}: {
  products: Product[];
  selectedDealType?: DealType;
  showEmptySections?: boolean;
}) {
  if (products.length === 0 && !showEmptySections) return null;

  const groupedDeals = groupDealsByType(products);
  const dealTypesInDisplayOrder = getDisplayOrder(selectedDealType);
  const hasAnyDeals = dealTypesInDisplayOrder.some((dealType) => groupedDeals[dealType].length > 0);

  if (!hasAnyDeals && !showEmptySections) {
    return null;
  }

  return (
    <div className="product-promotions">
      <div className="promo-banner">
        <div className="promo-banner__overlay">
          <div className="promo-banner__content">
            <span className="promo-badge">
              <Flame className="h-4 w-4" />
              Active Promotions
            </span>
            <h1>{selectedDealType ? DEAL_TYPE_LABELS[selectedDealType] : "Deals for Every Shopping Moment"}</h1>
            <p>
              {selectedDealType
                ? `${DEAL_TYPE_DESCRIPTIONS[selectedDealType]} Browse this section first, then explore the rest of the active offers below.`
                : "Only active offers are shown below, grouped by Daily, Weekly, Clearance, and Ceremony deals."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {DEFAULT_DISPLAY_ORDER.map((dealType) => (
          <Link
            key={dealType}
            href={`/promotions?type=${dealType}`}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectedDealType === dealType
                ? "border-[#ff5000] bg-[#ff5000] text-white"
                : "border-[#ffd0bf] bg-white text-[#7b4020] hover:border-[#ff5000] hover:text-[#ff5000]"
            }`}
          >
            {DEAL_TYPE_LABELS[dealType]}
          </Link>
        ))}
        <Link
          href="/promotions"
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            !selectedDealType
              ? "border-[#ff5000] bg-[#ff5000] text-white"
              : "border-[#ffd0bf] bg-white text-[#7b4020] hover:border-[#ff5000] hover:text-[#ff5000]"
          }`}
        >
          All deals
        </Link>
      </div>

      {dealTypesInDisplayOrder.map((dealType) => {
        const typedDeals = groupedDeals[dealType];
        if (typedDeals.length === 0 && !showEmptySections) {
          return null;
        }

        return (
          <div key={dealType} className="promo-section">
            <div className="promo-section__header">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{DEAL_TYPE_LABELS[dealType]}</h2>
              </div>
              <span className="text-sm font-medium text-slate-500">{typedDeals.length} active offer{typedDeals.length === 1 ? "" : "s"}</span>
            </div>

            <p className="m-0 text-sm text-slate-500">{DEAL_TYPE_DESCRIPTIONS[dealType]}</p>

            {typedDeals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#ffcfbe] bg-[#fff8f4] px-5 py-8 text-center text-sm text-slate-500">
                No active {DEAL_TYPE_LABELS[dealType].toLowerCase()} right now. Check back soon.
              </div>
            ) : (
              <div className="promo-section__items single-row">
                {typedDeals.map((product) => (
                  <div key={product.id} className="promo-item-wrapper deal">
                    <div className="promo-tag">{DEAL_TYPE_LABELS[dealType]}</div>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
