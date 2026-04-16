export function ProductInfo({
  description,
  price,
}: {
  description: string | null;
  price: string;
}) {
  return (
    <section className="product-info panel">
      {/* Heavy Price Block */}
      <div className="product-info__pricing">
        <p className="product-info__price">${Number(price).toFixed(2)}</p>
        <span className="product-info__discount-badge">Welcome Deal</span>
      </div>

      {/* AliExpress Style Meta List */}
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
          <span className="product-info__meta-value" style={{ lineHeight: 1.5 }}>
            {description ?? "Standard wholesale packaging with premium quality guarantee."}
          </span>
        </div>
      </div>
    </section>
  );
}
