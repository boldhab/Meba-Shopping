export function ProductInfo({
  description,
  price,
  stock,
  reviewCount,
}: {
  description: string | null;
  price: string;
  stock: number;
  reviewCount: number;
}) {
  const isInStock = stock > 0;

  return (
    <section className="product-info panel">
      <div className="product-info__pricing">
        <div>
          <p className="product-info__eyebrow">Marketplace price</p>
          <p className="product-info__price">${Number(price).toFixed(2)}</p>
        </div>
        <span className="product-info__discount-badge">Welcome deal</span>
      </div>

      <div className="product-info__trust-row">
        <div className="product-info__trust-pill">
          <strong>{isInStock ? "In stock" : "Sold out"}</strong>
          <span>{isInStock ? `${stock} pieces ready` : "Check back soon"}</span>
        </div>
        <div className="product-info__trust-pill">
          <strong>{reviewCount > 0 ? `${reviewCount} reviews` : "New listing"}</strong>
          <span>{reviewCount > 0 ? "Customer feedback visible" : "Be first to review"}</span>
        </div>
        <div className="product-info__trust-pill">
          <strong>Protection</strong>
          <span>7-day buyer guarantee</span>
        </div>
      </div>

      <div className="product-info__meta-list">
        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Condition:</span>
          <span className="product-info__meta-value">100% Brand New</span>
        </div>

        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Shipping:</span>
          <span className="product-info__meta-value">
            <span className="product-info__shipping">Free Shipping</span>
            <span className="product-info__shipping-sub">Estimated delivery: 3-5 Business Days</span>
          </span>
        </div>

        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Service:</span>
          <span className="product-info__meta-value">
            7-day Buyer Protection • Money Back Guarantee
          </span>
        </div>

        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Details:</span>
          <span className="product-info__meta-value product-info__details-text">
            {description ?? "Standard wholesale packaging with premium quality guarantee."}
          </span>
        </div>

        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Return:</span>
          <span className="product-info__meta-value">Easy refund support within the protection window</span>
        </div>
      </div>
    </section>
  );
}
