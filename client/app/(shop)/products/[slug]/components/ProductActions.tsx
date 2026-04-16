"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Heart, Share2 } from "lucide-react";

const LIKED_PRODUCTS_KEY = "meba-liked-products";

function readLikedProducts(): string[] {
  try {
    const raw = localStorage.getItem(LIKED_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeLikedProducts(values: string[]) {
  localStorage.setItem(LIKED_PRODUCTS_KEY, JSON.stringify(values));
}

export function ProductActions({ productId, productName }: { productId: string; productName: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const shareUrl = useMemo(() => (typeof window === "undefined" ? "" : window.location.href), []);

  useEffect(() => {
    const liked = readLikedProducts();
    setIsLiked(liked.includes(productId));
  }, [productId]);

  const toggleLike = () => {
    const liked = readLikedProducts();
    if (liked.includes(productId)) {
      writeLikedProducts(liked.filter((id) => id !== productId));
      setIsLiked(false);
      setFeedback("Removed from likes");
      return;
    }
    writeLikedProducts([...liked, productId]);
    setIsLiked(true);
    setFeedback("Saved to likes");
  };

  const shareProduct = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          text: `Check out this product: ${productName}`,
          url: shareUrl,
        });
        setFeedback("Shared");
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Link copied");
    } catch {
      setFeedback("Share canceled");
    }
  };

  return (
    <div className="product-actions">
      <div className="product-actions__buttons">
        <button
          type="button"
          className={`product-actions__button ${isLiked ? "is-liked" : ""}`}
          onClick={toggleLike}
          aria-pressed={isLiked}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
          {isLiked ? "Liked" : "Like"}
        </button>
        <button type="button" className="product-actions__button" onClick={shareProduct}>
          <Share2 size={16} />
          Share
        </button>
      </div>
      {feedback ? (
        <p className="product-actions__feedback">
          <Check size={14} />
          {feedback}
        </p>
      ) : null}
    </div>
  );
}
