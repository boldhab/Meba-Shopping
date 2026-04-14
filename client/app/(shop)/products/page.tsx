import { ProductFilters } from "./components/ProductFilters";
import { ProductGrid } from "./components/ProductGrid";
import { Pagination } from "./components/Pagination";
import { getProducts } from "@/lib/api/products";

export default async function ProductsPage(props: {
  searchParams?: Promise<{ search?: string; categoryId?: string }>;
}) {
  const searchParams = await props.searchParams;
  const p = await getProducts({ search: searchParams?.search, categoryId: searchParams?.categoryId });

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
          Products
        </h1>
        <p className="text-lg text-zinc-500">
          Find exactly what you are looking for in our fresh and organic selections.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <ProductFilters />
        </div>
        <div className="flex-1">
          <ProductGrid products={p.items} />
          {p.total > 20 && <Pagination />}
        </div>
      </div>
    </section>
  );
}

