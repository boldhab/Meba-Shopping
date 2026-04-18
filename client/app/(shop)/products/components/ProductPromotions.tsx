"use client";

import { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { Zap, ShieldCheck, Award, Flame } from "lucide-react";

export function ProductPromotions({ products }: { products: Product[] }) {
  // Select a few products to feature if they exist
  const flashDeals = products.slice(0, 3);
  const sponsored = products.slice(3, 5);

  if (products.length === 0) return null;

  return (
    <div className="product-promotions">
      {/* Main Promotion Banner */}
      <div className="promo-banner">
        <div className="promo-banner__overlay">
          <div className="promo-banner__content">
            <span className="promo-badge">
              <Flame className="h-4 w-4" />
              Limited Time Only
            </span>
            <h1>Meba Super Sale</h1>
            <p>Up to 70% off on selected premium items. Don't miss out on our flash deals!</p>
            <div className="promo-timer">
              <div className="timer-unit"><span>02</span><small>Hrs</small></div>
              <div className="timer-sep">:</div>
              <div className="timer-unit"><span>14</span><small>Min</small></div>
              <div className="timer-sep">:</div>
              <div className="timer-unit"><span>36</span><small>Sec</small></div>
            </div>
          </div>
        </div>
      </div>

      <div className="promo-grid">
        {/* Flash Deals Section */}
        <div className="promo-section">
          <div className="promo-section__header">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500 fill-orange-500" />
              <h2 className="text-xl font-bold">Flash Deals</h2>
            </div>
            <span className="text-sm font-medium text-slate-500">Ending soon</span>
          </div>
          <div className="promo-section__items">
            {flashDeals.map((product) => (
              <div key={product.id} className="promo-item-wrapper deal">
                <div className="promo-tag">Choice</div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Sponsored / Brand Section */}
        <div className="promo-section">
          <div className="promo-section__header">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-500 fill-blue-500" />
              <h2 className="text-xl font-bold">Sponsored</h2>
            </div>
             <div className="flex items-center gap-1 text-[10px] text-slate-400">
               <ShieldCheck className="h-3 w-3" />
               Verified Sellers
             </div>
          </div>
          <div className="promo-section__items">
            {sponsored.map((product) => (
              <div key={product.id} className="promo-item-wrapper sponsored">
                <div className="promo-tag sponsored">Sponsored</div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
