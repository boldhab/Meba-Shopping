import { ProductFilters } from "./components/ProductFilters";
import { ProductGrid } from "./components/ProductGrid";
import { Pagination } from "./components/Pagination";

export default function ProductsPage() {
  return (
    <section className="page-stack">
      <h1>Products</h1>
      <ProductFilters />
      <ProductGrid />
      <Pagination />
    </section>
  );
}
