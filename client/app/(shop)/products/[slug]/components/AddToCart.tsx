"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/api/products";
import { useCart } from "@/lib/hooks/useCart";
import { getProductImageUrls } from "@/lib/utils/productImages";
import { ProductActions } from "./ProductActions";

export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const canAddToCart = product.stock > 0;
  const variantOptions = [
    { id: "single", label: "Single", units: 1 },
    { id: "pack-3", label: "Pack of 3", units: 3 },
    { id: "family-pack", label: "Family pack", units: 6 },
  ] as const;

  const [selectedVariantId, setSelectedVariantId] = useState<(typeof variantOptions)[number]["id"]>("single");
  const selectedVariant = variantOptions.find((variant) => variant.id === selectedVariantId) ?? variantOptions[0];

  const selectedPrice = useMemo(() => {
    return Number(product.price) * selectedVariant.units;
  }, [product.price, selectedVariant.units]);

  const deliveryEstimate = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    const offset = selectedVariant.units > 1 ? 1 : 0;
    start.setDate(now.getDate() + 3 + offset);
    end.setDate(now.getDate() + 6 + offset);
    const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, [selectedVariant.units]);

  const stockUrgency =
    product.stock <= 0
      ? "Currently unavailable"
      : product.stock <= 5
        ? `Only ${product.stock} left. Order soon.`
        : product.stock <= 15
          ? "Limited stock. Ships while available."
          : "In stock and ready to ship.";

  const [fallbackImage] = getProductImageUrls(product.slug, product.name);
  const coverImage = product.imageUrl ?? fallbackImage;

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    await addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      quantity: selectedVariant.units,
      stock: product.stock,
      imageUrl: coverImage,
      variantId: selectedVariant.id,
      variantLabel: selectedVariant.label,
    });
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  return (
    <section className="product-purchase">
      <div className="product-purchase__status">
        <strong>{canAddToCart ? "Ready to ship" : "Out of stock"}</strong>
        <span>{canAddToCart ? `${product.stock} available` : "This item is currently unavailable."}</span>
      </div>

      <div className="product-purchase__delivery">
        <div className="product-purchase__delivery-row">
          <strong>Delivery estimate</strong>
          <span>{canAddToCart ? deliveryEstimate : "Unavailable"}</span>
        </div>
        <div className="product-purchase__delivery-row">
          <strong>Stock alert</strong>
          <span>{stockUrgency}</span>
        </div>
      </div>

      <div className="product-variants">
        <p className="product-variants__label">Variant</p>
        <div className="product-variants__options">
          {variantOptions.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className={`product-variants__option ${variant.id === selectedVariantId ? "is-selected" : ""}`}
              onClick={() => setSelectedVariantId(variant.id)}
            >
              {variant.label}
            </button>
          ))}
        </div>
      </div>

      <div className="product-purchase__meta">
        <span>Secure checkout</span>
        <span>Fast dispute support</span>
        <span>Buyer protection</span>
      </div>

      <div className="product-purchase__buttons">
        <button className="button--ae-buy" type="button" disabled={!canAddToCart} onClick={() => void handleBuyNow()}>
          Buy Now
        </button>
        <button className="button--ae-cart" type="button" disabled={!canAddToCart} onClick={() => void handleAddToCart()}>
          Add to Cart
        </button>
      </div>

      <ProductActions productId={product.id} productName={product.name} />

      <div className="product-trust-badges">
        <div className="product-trust-badge">
          <strong>Authentic quality</strong>
          <span>Verified sourcing checks</span>
        </div>
        <div className="product-trust-badge">
          <strong>Return support</strong>
          <span>Easy 7-day returns</span>
        </div>
        <div className="product-trust-badge">
          <strong>Secure payment</strong>
          <span>Protected checkout flow</span>
        </div>
        <div className="product-trust-badge">
          <strong>Fast response</strong>
          <span>Help desk within 24h</span>
        </div>
      </div>

      <p className="product-purchase__note">Compare prices, check reviews, and confirm your delivery estimate before you order.</p>

      <div className="product-sticky-buy">
        <div>
          <p className="product-sticky-buy__price">${selectedPrice.toFixed(2)}</p>
          <p className="product-sticky-buy__variant">{selectedVariant.label}</p>
        </div>
        <button className="product-sticky-buy__button" type="button" disabled={!canAddToCart} onClick={() => void handleAddToCart()}>
          Add to Cart
        </button>
      </div>
    </section>
  );
}
