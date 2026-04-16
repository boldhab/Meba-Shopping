import { ProductReview } from "@/lib/api/products";
import { formatDate } from "@/lib/utils/formatDate";

export function ReviewSection({ reviews }: { reviews: ProductReview[] }) {
  return (
    <section className="review-section">
      <h2>Customer Reviews ({reviews.length})</h2>

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
