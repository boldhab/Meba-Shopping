import { ProductReview } from "@/lib/api/products";
import { formatDate } from "@/lib/utils/formatDate";

export function ReviewSection({
  reviews,
  averageRating,
}: {
  reviews: ProductReview[];
  averageRating: number | null;
}) {
  return (
    <section className="review-section">
      <div className="review-section__header">
        <div>
          <p className="review-section__eyebrow">Social proof</p>
          <h2>Customer Reviews ({reviews.length})</h2>
        </div>
        {typeof averageRating === "number" && (
          <div className="review-section__summary">
            <strong>{averageRating.toFixed(1)} / 5</strong>
            <span>Average rating from verified buyers</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="review-section__empty">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="review-section__list">
          {reviews.map((review) => (
            <li className="review-card" key={review.id}>
              <div className="review-card__header">
                <div>
                  <p className="review-card__author">{review.user.name || "Anonymous customer"}</p>
                  <p className="review-card__date">{formatDate(review.createdAt)}</p>
                </div>
                <p className="review-card__rating">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
              </div>
              {review.comment && <p className="review-card__comment">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
