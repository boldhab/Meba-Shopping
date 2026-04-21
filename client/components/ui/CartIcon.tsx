"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";

export function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative inline-flex items-center justify-center rounded-full p-2 text-(--color-text)">
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f04438] px-1 text-[11px] font-semibold text-white">
          {totalItems}
        </span>
      ) : null}
    </Link>
  );
}
