"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check, Flame, Calendar, Tag, Sparkles } from "lucide-react";
import { type Product, type DealType } from "@/lib/api/products";
import { getProductPlaceholderImage } from "@/lib/utils/productImages";
import { useCart } from "@/lib/hooks/useCart";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/contexts/ToastContext";
import { addWishlistItem, removeWishlistItem } from "@/lib/api/account";
import { Rating } from "./Rating";
import { PriceTag } from "./PriceTag";

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
    label: "Clearance",
    icon: Tag,
    badgeClass: "bg-rose-600 text-white",
  },
  CEREMONY: {
    label: "Celebration",
    icon: Sparkles,
    badgeClass: "bg-purple-600 text-white",
  },
};

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();

  const [imgSrc, setImgSrc] = useState<string>(product.imageUrl ?? getProductPlaceholderImage());
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= 5;
  const productHref = `/products/${product.slug || product.id}`;
  const activeDeal = product.isDealActive && product.dealType ? dealConfig[product.dealType] : null;

  // Calculate review stats from authentic reviews
  const reviews = product.reviews ?? [];
  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        quantity: 1,
        stock: product.stock,
        imageUrl: imgSrc,
      });

      setIsAdded(true);
      toast.success(`Added ${product.name} to cart.`, { title: "Cart Updated" });
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not add item to cart.";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      toast.info("Sign in to save items to your wishlist.", { title: "Wishlist" });
      return;
    }

    if (isWishlistLoading) return;
    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        await removeWishlistItem(token, product.id);
        setIsWishlisted(false);
        toast.info(`Removed ${product.name} from wishlist.`);
      } else {
        await addWishlistItem(token, {
          id: product.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: imgSrc,
          price: Number(product.price),
          stockStatus: product.stock > 0 ? "In stock" : "Out of stock",
          popularity: 1,
          dateAdded: new Date().toISOString(),
        });
        setIsWishlisted(true);
        toast.success(`Saved ${product.name} to wishlist!`, { title: "Wishlist Updated" });
      }
    } catch {
      toast.error("Failed to update wishlist.");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <Link
      href={productHref}
      className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
      aria-label={`View details for ${product.name}`}
    >
      {/* Media Box */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={() => setImgSrc(getProductPlaceholderImage())}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {activeDeal && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs ${activeDeal.badgeClass}`}
            >
              <activeDeal.icon className="w-3 h-3" />
              {activeDeal.label}
            </span>
          )}

          {product.discountPercent ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
              -{product.discountPercent}% OFF
            </span>
          ) : product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
              -{Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)}% OFF
            </span>
          ) : null}

          {isOutOfStock ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-white backdrop-blur-xs">
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-2xs">
              Only {product.stock} left!
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-xs transition-transform active:scale-90 hover:bg-white ${
            isWishlisted ? "text-rose-600" : "text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-600" : ""}`} />
        </button>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {product.category && (
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 line-clamp-1">
            {product.category.name}
          </span>
        )}

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mb-3 mt-auto flex items-center min-h-[20px]">
          {hasReviews ? (
            <Rating value={averageRating} size="sm" showValue reviewCount={reviewCount} />
          ) : (
            <span className="text-[11px] font-medium text-slate-400">No reviews yet</span>
          )}
        </div>

        {/* Footer Area: Price & Quick Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <PriceTag
              value={Number(product.price)}
              originalPrice={product.compareAtPrice ? Number(product.compareAtPrice) : undefined}
              size="md"
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : isAdded
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : isAdding ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
