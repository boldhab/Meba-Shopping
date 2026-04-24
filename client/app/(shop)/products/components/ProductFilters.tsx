import Link from "next/link";
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
    <aside className="panel product-filters">
      <div className="product-filters__header">
        <h2>Filters</h2>
        {hasFilters && (
          <Link className="product-filters__clear" href="/products">
            Clear all
          </Link>
        )}
      </div>

      <form action="/products" className="product-filters__form">
        <label className="label-stack" htmlFor="search">
          <span>Search</span>
          <input
            id="search"
            className="input"
            type="search"
            name="search"
            defaultValue={values.search}
            placeholder="Try bananas, milk, bread..."
          />
        </label>

        <label className="label-stack" htmlFor="categoryId">
          <span>Category</span>
          <select id="categoryId" className="input" name="categoryId" defaultValue={values.categoryId ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="product-filters__price-range">
          <label className="label-stack" htmlFor="minPrice">
            <span>Min price</span>
            <input
              id="minPrice"
              className="input"
              type="number"
              min="0"
              step="0.01"
              name="minPrice"
              defaultValue={values.minPrice}
              placeholder="0.00"
            />
          </label>
          <label className="label-stack" htmlFor="maxPrice">
            <span>Max price</span>
            <input
              id="maxPrice"
              className="input"
              type="number"
              min="0"
              step="0.01"
              name="maxPrice"
              defaultValue={values.maxPrice}
              placeholder="100.00"
            />
          </label>
        </div>

        <label className="label-stack" htmlFor="sort">
          <span>Sort by</span>
          <select id="sort" className="input" name="sort" defaultValue={values.sort ?? ""}>
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </label>

        <button className="button" type="submit">
          Apply filters
        </button>
      </form>
    </aside>
  );
}
