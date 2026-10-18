"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/api/products";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useToast } from "@/contexts/ToastContext";
import { ProductActions } from "./ProductActions";
import { ShoppingCart, Zap, Check, ShieldCheck, Truck, RefreshCw, AlertCircle } from "lucide-react";

export function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, openCartDrawer } = useCart();
  const { toast } = useToast();

  const canAddToCart = product.stock > 0;
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  type BundleOption = { id: string; label: string; units: number; discount?: string };
  const variantOptions: BundleOption[] = [
    { id: "single", label: "Single Unit", units: 1 },
    { id: "pack-3", label: "Pack of 3", units: 3, discount: "5% off" },
    { id: "family-pack", label: "Family Bundle (6)", units: 6, discount: "10% off" },
  ];

  const [selectedVariantId, setSelectedVariantId] = useState<string>("single");
  const selectedVariant = variantOptions.find((variant) => variant.id === selectedVariantId) ?? variantOptions[0];

  const selectedPrice = useMemo(() => {
    const base = Number(product.price) * selectedVariant.units;
    if (selectedVariant.units === 3) return base * 0.95;
    if (selectedVariant.units === 6) return base * 0.9;
    return base;
  }, [product.price, selectedVariant.units]);

  const deliveryEstimate = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setDate(now.getDate() + 1);
    end.setDate(now.getDate() + 2);
    const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, []);

  const stockUrgency =
    product.stock <= 0
      ? "Currently out of stock"
      : product.stock <= 5
        ? `Only ${product.stock} units left — order soon!`
        : product.stock <= 15
          ? `Low stock: ${product.stock} units remaining.`
          : "In stock and ready for immediate dispatch.";

  const handleAddToCart = async () => {
    if (!canAddToCart || isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: selectedPrice / selectedVariant.units,
        quantity: selectedVariant.units,
        stock: product.stock,
        imageUrl: product.imageUrl ?? undefined,
        variantId: selectedVariant.id,
        variantLabel: selectedVariant.label,
      });

      setIsAdded(true);
      toast.success(`Added ${product.name} (${selectedVariant.label}) to cart.`, { title: "Cart Updated" });
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add product to cart.";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    openCartDrawer();
  };

  return (
    <section className="space-y-6 pt-2">
      {/* Stock Availability Pill */}
      <div className="flex items-center gap-2">
        <span
          className={`flex h-2.5 w-2.5 rounded-full ${
            canAddToCart ? (product.stock <= 5 ? "bg-amber-500 animate-pulse" : "bg-emerald-500") : "bg-rose-500"
          }`}
        />
        <span className="text-xs font-bold text-slate-700">{stockUrgency}</span>
      </div>

      {/* Delivery Estimate Box */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-slate-700">
          <Truck className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            Estimated delivery to <strong>Addis Ababa</strong>:
          </span>
        </div>
        <strong className="text-slate-900">{canAddToCart ? deliveryEstimate : "N/A"}</strong>
      </div>

      {/* Package / Variant Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
          Select Quantity Bundle:
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {variantOptions.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 font-bold"
                    : "border-slate-200 hover:border-slate-300 bg-white font-medium"
                }`}
              >
                <span className="text-xs text-slate-900">{variant.label}</span>
                {variant.discount && (
                  <span className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                    {variant.discount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          disabled={!canAddToCart || isAdding}
          onClick={handleBuyNow}
          className="w-full py-4 px-6 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>Buy Now ({formatPrice(selectedPrice)})</span>
        </button>

        <button
          type="button"
          disabled={!canAddToCart || isAdding}
          onClick={handleAddToCart}
          className={`w-full py-3.5 px-6 rounded-2xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
            isAdded
              ? "bg-emerald-600 text-white border-emerald-600"
              : "border-slate-300 hover:bg-slate-50 text-slate-800 bg-white"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Added to Cart!</span>
            </>
          ) : isAdding ? (
            <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

      {/* Wishlist & Share Actions */}
      <ProductActions productId={product.id} productName={product.name} />

      {/* Trust Badges Bar */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Guaranteed Fresh</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80">
          <RefreshCw className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Easy 7-Day Returns</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80">
          <Truck className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Free Delivery over 1,000 ETB</span>
        </div>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/80">
          <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Cash or Mobile Money</span>
        </div>
      </div>

      {/* Sticky Bottom Buy Bar (for Mobile & Scroll) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 md:hidden flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-base font-extrabold text-slate-900 leading-none">
            {formatPrice(selectedPrice)}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            {selectedVariant.label}
          </span>
        </div>
        <button
          type="button"
          disabled={!canAddToCart || isAdding}
          onClick={handleAddToCart}
          className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isAdded ? "Added!" : "Add to Cart"}</span>
        </button>
      </div>
    </section>
  );
}
