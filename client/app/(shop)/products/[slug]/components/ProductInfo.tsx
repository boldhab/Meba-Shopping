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
  const availabilityLabel = stock > 0 ? "In stock" : "Out of stock";

  return (
    <section className="product-info panel">
      <p className="product-info__price">${Number(price).toFixed(2)}</p>
      <p className="product-info__description">{description ?? "No description is available yet for this product."}</p>
      <div className="product-info__meta">
        <p>
          <strong>Availability:</strong> {availabilityLabel} ({stock} unit{stock === 1 ? "" : "s"})
        </p>
        <p>
          <strong>Reviews:</strong>{" "}
          {averageRating ? `${averageRating.toFixed(1)} / 5 from ${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "No reviews yet"}
        </p>
      </div>
    </section>
  );
}
