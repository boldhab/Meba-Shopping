import { Product } from "@/lib/api/products";

export function AddToCart({ product }: { product: Product }) {
  const canAddToCart = product.stock > 0;

  return (
    <section className="product-purchase">
      <div className="product-purchase__status">
        <strong>{canAddToCart ? "Ready to ship" : "Out of stock"}</strong>
        <span>{canAddToCart ? `${product.stock} available` : "This item is currently unavailable."}</span>
      </div>

      <div className="product-purchase__meta">
        <span>Secure checkout</span>
        <span>Fast dispute support</span>
        <span>Buyer protection</span>
      </div>

      <div className="product-purchase__buttons">
        <button className="button--ae-buy" type="button" disabled={!canAddToCart}>
          Buy Now
        </button>
        <button className="button--ae-cart" type="button" disabled={!canAddToCart}>
          Add to Cart
        </button>
      </div>

      <p className="product-purchase__note">Compare prices, check reviews, and confirm your delivery estimate before you order.</p>
    </section>
  );
}
