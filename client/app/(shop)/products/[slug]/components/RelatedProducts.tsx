import { Product } from "@/lib/api/products";
import { ProductCard } from "@/components/ui/ProductCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-slate-200/80">
      <div className="mb-8">
        <span className="text-xs uppercase font-bold tracking-widest text-orange-600 mb-1 block">
          You may also like
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Related Products
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
