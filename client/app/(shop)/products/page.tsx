import { ProductGrid } from "./components/ProductGrid";
import { Pagination } from "./components/Pagination";
import { getProducts } from "@/lib/api/products";

type ProductSearchParams = {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
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
    page: searchParams?.page || undefined,
  };

  const productsResult = await getProducts(filters);

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

      <div className="products-layout-single">
        <ProductGrid products={productsResult.items} />
        {productsResult.total > 20 && (
          <Pagination
            currentPage={parseInt(filters.page || "1")}
            totalPages={Math.ceil(productsResult.total / 20)}
          />
        )}
      </div>
    </section>
  );
}
