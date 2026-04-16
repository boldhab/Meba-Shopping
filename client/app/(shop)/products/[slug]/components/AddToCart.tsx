import { Product } from "@/lib/api/products";

export function AddToCart({ product }: { product: Product }) {
  const canAddToCart = product.stock > 0;

  return (
    <section className="product-purchase">
      <p className="product-purchase__status">
        {canAddToCart ? "Ready to add to cart." : "Currently unavailable due to low inventory."}
      </p>
      <button className="button" type="button" disabled={!canAddToCart} aria-disabled={!canAddToCart}>
        Add to cart
      </button>
    </section>
  );
}
