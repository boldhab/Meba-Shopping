import { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/ui/ProductCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="related-products page-stack">
      <div className="related-products__heading">
        <p className="related-products__eyebrow">You may also like</p>
        <h2>Related products</h2>
      </div>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
