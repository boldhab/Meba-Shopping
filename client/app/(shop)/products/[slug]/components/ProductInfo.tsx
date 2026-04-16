import { ProductReview } from "@/lib/api/products";

function calculateAverageRating(reviews: ProductReview[]) {
  if (reviews.length === 0) {
    return null;
  }
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
}

export function ProductInfo({
  description,
  price,
  stock,
  reviews,
}: {
  description: string | null;
  price: string;
  stock: number;
  reviews: ProductReview[];
}) {
  const averageRating = calculateAverageRating(reviews);
  const reviewText = averageRating
    ? `${averageRating.toFixed(1)} Stars (${reviews.length} Reviews)`
    : "No reviews yet";

  return (
    <section className="product-info panel">
      {/* Heavy Price Block */}
      <div className="product-info__pricing">
        <p className="product-info__price">${Number(price).toFixed(2)}</p>
        <span className="product-info__discount-badge">Super Deal</span>
      </div>

      {/* AliExpress Style Meta List */}
      <div className="product-info__meta-list">
        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Condition:</span>
          <span className="product-info__meta-value">100% Brand New</span>
        </div>

        <div className="product-info__meta-item">
          <span className="product-info__meta-label">Ratings:</span>
          <span className="product-info__meta-value" style={{ color: "#bfa044" }}>★ {reviewText}</span>
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
          <span className="product-info__meta-value">
            {description ?? "Standard wholesale packaging with premium quality guarantee."}
          </span>
        </div>
      </div>
    </section>
  );
}
