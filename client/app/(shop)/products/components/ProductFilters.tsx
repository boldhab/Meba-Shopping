import Link from "next/link";
import { SlidersHorizontal, Search, RotateCcw, ArrowUpDown, Tag } from "lucide-react";
import { Category } from "@/lib/api/products";

type FilterValues = {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export function ProductFilters({ categories, values }: { categories: Category[]; values: FilterValues }) {
  const hasFilters = Boolean(values.search || values.categoryId || values.minPrice || values.maxPrice || values.sort);

  return (
    <aside className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Catalog Filters</h2>
        </div>
        {hasFilters && (
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </Link>
        )}
      </div>

      <form action="/products" className="pt-4 space-y-4">
        {/* Search */}
        <div className="space-y-1.5">
          <label htmlFor="search" className="block text-xs font-bold text-slate-700">
            Keyword Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="search"
              type="search"
              name="search"
              defaultValue={values.search}
              placeholder="e.g. Milk, Bananas..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label htmlFor="categoryId" className="block text-xs font-bold text-slate-700">
            Aisle / Category
          </label>
          <div className="relative">
            <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={values.categoryId ?? ""}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">Price Range (ETB)</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                id="minPrice"
                type="number"
                min="0"
                step="0.01"
                name="minPrice"
                defaultValue={values.minPrice}
                placeholder="Min ETB"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
              />
            </div>
            <div>
              <input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                name="maxPrice"
                defaultValue={values.maxPrice}
                placeholder="Max ETB"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <label htmlFor="sort" className="block text-xs font-bold text-slate-700">
            Sort Order
          </label>
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              id="sort"
              name="sort"
              defaultValue={values.sort ?? ""}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all text-slate-900 cursor-pointer"
            >
              <option value="">Featured / Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical: A to Z</option>
              <option value="name-desc">Alphabetical: Z to A</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Apply Filters</span>
        </button>
      </form>
    </aside>
  );
}
