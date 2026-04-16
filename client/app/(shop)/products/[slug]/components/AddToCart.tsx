import { Product } from "@/lib/api/products";

export function AddToCart({ product }: { product: Product }) {
  const canAddToCart = product.stock > 0;

  return (
    <section className="product-purchase">
      <div className="product-purchase__status">
        <strong>Quantity:</strong> 1 piece ({canAddToCart ? `${product.stock} available` : "Out of stock"})
      </div>
      
      <div className="product-purchase__buttons">
        <button className="button--ae-buy" type="button" disabled={!canAddToCart} aria-disabled={!canAddToCart}>
          Buy Now
        </button>
        <button className="button--ae-cart" type="button" disabled={!canAddToCart} aria-disabled={!canAddToCart}>
          Add to Cart
        </button>
      </div>
    </section>
  );
}
