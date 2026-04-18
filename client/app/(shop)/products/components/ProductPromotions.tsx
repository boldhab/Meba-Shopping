"use client";

import { DealType, Product } from "@/lib/api/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { Flame } from "lucide-react";

const DEAL_TYPE_LABELS: Record<DealType, string> = {
  DAILY: "Daily Deals",
  WEEKLY: "Weekly Deals",
  CLEARANCE: "Clearance Deals",
  CEREMONY: "Ceremony Deals",
};

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

export function ProductPromotions({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const groupedDeals = groupDealsByType(products);
  const dealTypesInDisplayOrder: DealType[] = ["DAILY", "CEREMONY", "WEEKLY", "CLEARANCE"];
  const hasAnyDeals = dealTypesInDisplayOrder.some((dealType) => groupedDeals[dealType].length > 0);

  if (!hasAnyDeals) {
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
            <h1>Deals for Every Shopping Moment</h1>
            <p>Only active offers are shown below, grouped by Daily, Weekly, Clearance, and Ceremony deals.</p>
          </div>
        </div>
      </div>

      {dealTypesInDisplayOrder.map((dealType) => {
        const typedDeals = groupedDeals[dealType];
        if (typedDeals.length === 0) {
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
            <div className="promo-section__items single-row">
              {typedDeals.map((product) => (
                <div key={product.id} className="promo-item-wrapper deal">
                  <div className="promo-tag">{DEAL_TYPE_LABELS[dealType]}</div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
