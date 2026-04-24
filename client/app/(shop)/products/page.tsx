import { ProductSort, getCategories } from "@/lib/api/products";
import { ProductFilters } from "./components/ProductFilters";
import { ProductGrid } from "./components/ProductGrid";
import { Pagination } from "./components/Pagination";
import { ProductPromotions } from "./components/ProductPromotions";
import { getActiveDeals, getProducts } from "@/lib/api/products";

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
    getActiveDeals({ limit: "120" }),
    getCategories(),
  ]);

  const currentPage = Number.parseInt(filters.page || "1", 10) || 1;

  return (
    <section className="page-stack products-page">
      <div>
        <h1>Products</h1>
        <p className="products-page__description">
          Browse our full collection of premium products.
        </p>
        <p className="products-page__meta">
          Showing {productsResult.items.length} of {productsResult.total} product
          {productsResult.total === 1 ? "" : "s"}
        </p>
      </div>
      
      <ProductPromotions products={activeDealsResult.items} />

      <div className="products-layout">
        <ProductFilters categories={categories} values={filters} />

        <div className="products-layout__content">
          <ProductGrid products={productsResult.items} />
          {productsResult.total > 20 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(productsResult.total / 20)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
