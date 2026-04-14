import Link from "next/link";
import { Product } from "@/lib/api/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative rounded-2xl bg-white p-4 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4">
        {/* Placeholder for image - you can add next/image later */}
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform duration-500">
          <span className="text-4xl">🛒</span>
        </div>
      </div>
      
      <div className="space-y-1">
        {product.category && (
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {product.category.name}
          </p>
        )}
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          <Link href={`/products/${product.slug}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {product.description}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          ${Number(product.price).toFixed(2)}
        </p>
        <button 
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white transition-all hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 active:scale-95"
          aria-label="Add to cart"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </article>
  );
}
