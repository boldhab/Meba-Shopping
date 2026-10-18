import Link from "next/link";
import { ChevronRight, Home, Sparkles, Filter } from "lucide-react";
import { ProductSort, getCategories, getActiveDeals, getProducts } from "@/lib/api/products";
import { ProductFilters } from "./components/ProductFilters";
import { ProductGrid } from "./components/ProductGrid";
import { Pagination } from "./components/Pagination";
import { ProductPromotions } from "./components/ProductPromotions";

type ProductSearchParams = {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  sort?: ProductSort;
};

function normalizeSort(input?: string): ProductSort | undefined {
  if (!input) return undefined;
  return ["price-asc", "price-desc", "name-asc", "name-desc"].includes(input)
    ? (input as ProductSort)
    : undefined;
}

export default async function ProductsPage(props: {
  searchParams?: Promise<ProductSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const filters: ProductSearchParams = {
    search: searchParams?.search?.trim() || undefined,
    categoryId: searchParams?.categoryId || undefined,
    minPrice: searchParams?.minPrice || undefined,
    maxPrice: searchParams?.maxPrice || undefined,
    page: searchParams?.page || undefined,
    sort: normalizeSort(searchParams?.sort),
  };

  const [productsResult, activeDealsResult, categories] = await Promise.all([
    getProducts(filters),
    getActiveDeals({ limit: "12" }),
    getCategories(),
  ]);

  const currentPage = Number.parseInt(filters.page || "1", 10) || 1;
  const currentCategory = categories.find((c) => c.id === filters.categoryId);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Breadcrumb & Header Banner */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/products" className={`hover:text-blue-600 transition-colors ${!currentCategory ? "font-bold text-slate-900" : ""}`}>
              Products
            </Link>
            {currentCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-900">{currentCategory.name}</span>
              </>
            )}
          </nav>

          {/* Title & Counter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentCategory ? currentCategory.name : "Marketplace & Supermarket Catalog"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore quality groceries, electronics, and essentials with verified authentic reviews and quick Addis delivery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                <span>{productsResult.total}</span>
                <span className="text-slate-400 font-normal">items available</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Active Deals Banner if available and no specific deep filter is applied */}
        {!filters.search && !filters.categoryId && activeDealsResult.items.length > 0 && (
          <div className="p-4 sm:p-6 rounded-2xl bg-linear-to-r from-orange-500 to-amber-500 text-white shadow-md">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-100 mb-1">
              <Sparkles className="w-4 h-4 fill-amber-200" />
              <span>Featured Deals & Flash Promotions</span>
            </div>
            <ProductPromotions products={activeDealsResult.items.slice(0, 4)} />
          </div>
        )}

        {/* 2-Column Catalog Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 shrink-0">
            <ProductFilters categories={categories} values={filters} />
          </div>

          {/* Products Grid & Pagination */}
          <div className="flex-1 w-full min-w-0">
            <ProductGrid products={productsResult.items} />

            {productsResult.total > 20 && (
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(productsResult.total / 20)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
