import { ProductFilters } from "./components/ProductFilters";
import { ProductGrid } from "./components/ProductGrid";
import { Pagination } from "./components/Pagination";
import { getCategories, getProducts } from "@/lib/api/products";

type ProductSearchParams = {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function ProductsPage(props: {
  searchParams?: Promise<ProductSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const filters: ProductSearchParams = {
    search: searchParams?.search?.trim() || undefined,
    categoryId: searchParams?.categoryId || undefined,
    minPrice: searchParams?.minPrice || undefined,
    maxPrice: searchParams?.maxPrice || undefined,
  };

  const [productsResult, categories] = await Promise.all([getProducts(filters), getCategories()]);

  return (
    <section className="page-stack products-page">
      <div>
        <h1>Products</h1>
        <p className="products-page__description">
          Browse the catalog and narrow results by category, keyword, and price range.
        </p>
        <p className="products-page__meta">
          Showing {productsResult.items.length} of {productsResult.total} product
          {productsResult.total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="products-layout">
        <div>
          <ProductFilters categories={categories} values={filters} />
        </div>
        <div className="products-layout__content">
          <ProductGrid products={productsResult.items} />
          {productsResult.total > 20 && <Pagination />}
        </div>
      </div>
    </section>
  );
}
