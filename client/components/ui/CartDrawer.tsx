"use client";

import React, { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { formatPrice } from "@/lib/utils/formatPrice";

const FREE_SHIPPING_THRESHOLD = 1000;

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    discountAmount,
    total,
    isCartDrawerOpen,
    closeCartDrawer,
    updateItemQuantity,
    removeItem,
  } = useCart();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isCartDrawerOpen) {
        closeCartDrawer();
      }
    },
    [isCartDrawerOpen, closeCartDrawer]
  );

  useEffect(() => {
    if (isCartDrawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCartDrawerOpen, handleKeyDown]);

  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const navigateTo = (path: string) => {
    closeCartDrawer();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-extrabold text-slate-900">Your Shopping Bag</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                  {totalItems}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1.5">
                <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                {amountRemaining > 0 ? (
                  <span>
                    Add <strong className="text-slate-900">{formatPrice(amountRemaining)}</strong> more for <strong className="text-emerald-600">FREE delivery</strong>!
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">
                    🎉 You unlocked FREE delivery!
                  </span>
                )}
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    amountRemaining === 0 ? "bg-emerald-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">Your bag is empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mb-6">
                    Looks like you haven&apos;t added any items yet. Explore our deals to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo("/products")}
                    className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.productId}-${item.variantId ?? "default"}`} className="py-4 flex gap-3.5 items-start">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug || item.productId}`}
                        onClick={closeCartDrawer}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2.5">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateItemQuantity(item.productId, item.variantId, item.quantity - 1);
                              } else {
                                removeItem(item.productId, item.variantId);
                              }
                            }}
                            className="p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary (if items > 0) */}
            {items.length > 0 && (
              <div className="p-6 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200/60">
                  <span>Estimated Total</span>
                  <span>{formatPrice(total || subtotal - discountAmount)}</span>
                </div>

                {/* Action Buttons */}
                <div className="grid gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo("/checkout")}
                    className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo("/cart")}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    View & Edit Full Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
