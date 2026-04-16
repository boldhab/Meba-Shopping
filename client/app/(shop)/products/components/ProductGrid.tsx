import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/lib/api/products";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="state-card">
        <p>No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
