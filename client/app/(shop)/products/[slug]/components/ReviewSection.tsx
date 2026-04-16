"use client";

import { FormEvent, useMemo, useState } from "react";
import { ProductReview } from "@/lib/api/products";
import { formatDate } from "@/lib/utils/formatDate";

export function ReviewSection({
  reviews,
  averageRating,
}: {
  reviews: ProductReview[];
  averageRating: number | null;
}) {
  const [allReviews, setAllReviews] = useState<ProductReview[]>(reviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const average = useMemo(() => {
    if (allReviews.length === 0) return averageRating;
    const total = allReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / allReviews.length;
  }, [allReviews, averageRating]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextComment = comment.trim();

    if (!nextComment) {
      setMessage("Please write a short comment.");
      return;
    }

    const newReview: ProductReview = {
      id: `local-${Date.now()}`,
      rating,
      comment: nextComment,
      createdAt: new Date().toISOString(),
      user: {
        id: "local-user",
        name: "You",
      },
    };

    setAllReviews((current) => [newReview, ...current]);
    setComment("");
    setRating(5);
    setMessage("Thanks! Your review was added.");
  };

  return (
    <section className="review-section">
      <div className="review-section__header">
        <div>
          <p className="review-section__eyebrow">Social proof</p>
          <h2>Customer Reviews ({allReviews.length})</h2>
        </div>
        {typeof average === "number" && (
          <div className="review-section__summary">
            <strong>{average.toFixed(1)} / 5</strong>
            <span>Average rating from verified buyers</span>
          </div>
        )}
      </div>

      <form className="review-form" onSubmit={handleSubmit}>
        <p className="review-form__label">Rate this product</p>
        <div className="review-form__stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`review-form__star ${value <= rating ? "is-active" : ""}`}
              onClick={() => setRating(value)}
              aria-label={`${value} star${value > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className="review-form__comment"
          rows={4}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Write your comment about the product..."
        />

        <div className="review-form__footer">
          <button type="submit" className="review-form__submit">
            Submit review
          </button>
          {message ? <p className="review-form__message">{message}</p> : null}
        </div>
      </form>

      {allReviews.length === 0 ? (
        <p className="review-section__empty">No reviews yet. Be the first to share your experience.</p>
      ) : (
        <ul className="review-section__list">
          {allReviews.map((review) => (
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
