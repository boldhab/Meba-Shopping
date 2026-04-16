import { ProductReview } from "@/lib/api/products";
import { formatDate } from "@/lib/utils/formatDate";

export function ReviewSection({ reviews }: { reviews: ProductReview[] }) {
  return (
    <section className="panel review-section">
      <h2>Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p className="review-section__empty">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="review-section__list">
          {reviews.map((review) => (
            <li className="review-card" key={review.id}>
              <div className="review-card__header">
                <p className="review-card__author">{review.user.name || "Anonymous customer"}</p>
                <p className="review-card__rating">{review.rating} / 5</p>
              </div>
              <p className="review-card__date">{formatDate(review.createdAt)}</p>
              {review.comment && <p className="review-card__comment">{review.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
