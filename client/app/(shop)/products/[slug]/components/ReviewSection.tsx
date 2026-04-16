"use client";

import { FormEvent, useMemo, useState } from "react";
import { ProductReview } from "@/lib/api/products";
import { createReview } from "@/lib/api/reviews";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils/formatDate";

export function ReviewSection({
  productId,
  reviews,
  averageRating,
}: {
  productId: string;
  reviews: ProductReview[];
  averageRating: number | null;
}) {
  const { token, isAuthenticated } = useAuth();
  const [allReviews, setAllReviews] = useState<ProductReview[]>(reviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const average = useMemo(() => {
    if (allReviews.length === 0) return averageRating;
    const total = allReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / allReviews.length;
  }, [allReviews, averageRating]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextComment = comment.trim();

    if (!isAuthenticated || !token) {
      setMessage("Please sign in to submit a review.");
      return;
    }

    if (!nextComment) {
      setMessage("Please write a short comment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReview({
        token,
        productId,
        rating,
        comment: nextComment,
      });

      setAllReviews((current) => [response.review, ...current]);
      setComment("");
      setRating(5);
      setMessage("Thanks! Your review was added.");
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Unable to submit review right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={!isAuthenticated || isSubmitting}
        />

        <div className="review-form__footer">
          <button
            type="submit"
            className="review-form__submit"
            disabled={!isAuthenticated || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit review"}
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
