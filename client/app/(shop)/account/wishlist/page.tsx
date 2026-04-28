"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type StockStatus = "In stock" | "Out of stock" | "Low stock";

type WishlistItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  stockStatus: StockStatus;
  popularity: number;
  dateAdded: string;
};

const initialItems: WishlistItem[] = [
  {
    id: "w1",
    name: "Organic Avocado Oil",
    slug: "organic-avocado-oil",
    image: "https://placehold.co/80x80?text=A",
    price: 980,
    salePrice: 850,
    stockStatus: "In stock",
    popularity: 93,
    dateAdded: "2026-04-23",
  },
  {
    id: "w2",
    name: "Quinoa Mix 1kg",
    slug: "quinoa-mix-1kg",
    image: "https://placehold.co/80x80?text=Q",
    price: 560,
    stockStatus: "Low stock",
    popularity: 81,
    dateAdded: "2026-04-15",
  },
  {
    id: "w3",
    name: "Almond Butter",
    slug: "almond-butter",
    image: "https://placehold.co/80x80?text=B",
    price: 720,
    stockStatus: "Out of stock",
    popularity: 70,
    dateAdded: "2026-03-30",
  },
];

function money(value: number) {
  return `${value.toLocaleString()} ETB`;
}

export default function WishlistPage() {
  const [items, setItems] = useState(initialItems);
  const [sortBy, setSortBy] = useState<"price" | "date" | "popularity">("date");
  const [qtyByItem, setQtyByItem] = useState<Record<string, number>>({});

  const sortedItems = useMemo(() => {
    const next = [...items];
    if (sortBy === "price") {
      next.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === "popularity") {
      next.sort((a, b) => b.popularity - a.popularity);
    } else {
      next.sort((a, b) => +new Date(b.dateAdded) - +new Date(a.dateAdded));
    }
    return next;
  }, [items, sortBy]);

  const removeItem = (id: string) => {
    const ok = window.confirm("Remove this product from wishlist?");
    if (!ok) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="page-stack gap-4">
      <header className="rounded-2xl border border-amber-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Wishlist</h1>
            <p className="mt-1 text-sm text-slate-600">Save products and move them to cart when you are ready.</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="wishlist-sort">Sort by</label>
            <select
              id="wishlist-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "price" | "date" | "popularity")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="price">Price</option>
              <option value="date">Date added</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Share wishlist (email)
          </button>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Share wishlist (social link)
          </button>
        </div>
      </header>

      {sortedItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Your wishlist is currently empty.</div>
      ) : (
        <div className="grid gap-3">
          {sortedItems.map((item) => {
            const quantity = qtyByItem[item.id] ?? 1;
            const activePrice = item.salePrice ?? item.price;

            return (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg border border-slate-200 object-cover" />

                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${item.slug}`} className="text-lg font-bold text-slate-900 hover:text-orange-600">
                      {item.name}
                    </Link>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-slate-800">{money(activePrice)}</span>
                      {item.salePrice ? <span className="text-slate-400 line-through">{money(item.price)}</span> : null}
                    </div>

                    <p className="mt-1 text-sm text-slate-600">Stock status: {item.stockStatus}</p>
                    <p className="text-sm text-slate-600">Date added: {new Date(item.dateAdded).toLocaleDateString()}</p>
                  </div>

                  <div className="w-full space-y-2 md:w-auto">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600" htmlFor={`qty-${item.id}`}>Qty</label>
                      <input
                        id={`qty-${item.id}`}
                        min={1}
                        type="number"
                        value={quantity}
                        onChange={(e) => setQtyByItem((prev) => ({ ...prev, [item.id]: Math.max(1, Number(e.target.value) || 1) }))}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
                        Add to cart
                      </button>
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Move to cart
                      </button>
                      <button onClick={() => removeItem(item.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                        Remove from wishlist
                      </button>
                      <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        Move to compare
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
