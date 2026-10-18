"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ProductReview } from "@/lib/api/products";
import { createReview } from "@/lib/api/reviews";
import { useAuth } from "@/lib/hooks/useAuth";
import { Rating } from "@/components/ui/Rating";
import { CheckCircle2, MessageSquare, Send, User, Sparkles } from "lucide-react";

export function ReviewSection({
  productId,
  reviews,
  averageRating,
}: {
  productId: string;
  reviews: ProductReview[];
  averageRating: number | null;
}) {
  const { token, isAuthenticated, user } = useAuth();
  const [allReviews, setAllReviews] = useState<ProductReview[]>(reviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const average = useMemo(() => {
    if (allReviews.length === 0) return averageRating;
    const total = allReviews.reduce((sum, review) => sum + review.rating, 0);
    return total / allReviews.length;
  }, [allReviews, averageRating]);

  // Rating breakdown distribution
  const ratingDistribution = useMemo(() => {
    const total = allReviews.length;
    const counts = [0, 0, 0, 0, 0]; // 1 to 5 stars
    allReviews.forEach((r) => {
      const idx = Math.min(Math.max(Math.round(r.rating) - 1, 0), 4);
      counts[idx]++;
    });

    return [5, 4, 3, 2, 1].map((star) => {
      const count = counts[star - 1];
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { star, count, percentage };
    });
  }, [allReviews]);

  const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent!",
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextComment = comment.trim();

    if (!isAuthenticated || !token) {
      setMessage({ type: "error", text: "Please sign in to submit a review." });
      return;
    }

    if (!nextComment) {
      setMessage({ type: "error", text: "Please write a brief comment describing your experience." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createReview({
        token,
        productId,
        rating,
        comment: nextComment,
      });

      // Optimistically prepend the review if user details are present
      const newReview: ProductReview = {
        id: response.review?.id || `rev-${Date.now()}`,
        rating,
        comment: nextComment,
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || "me",
          name: user?.name || "You",
        },
      };

      setAllReviews((current) => [newReview, ...current]);
      setComment("");
      setRating(5);
      setMessage({ type: "success", text: "Thank you! Your verified review has been published." });
      setShowForm(false);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Unable to submit review right now. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
      {/* Header and Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-100 items-center">
        {/* Overall Score */}
        <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Customer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Reviews
          </h2>

          <div className="flex items-baseline gap-3 mt-3">
            <span className="text-4xl sm:text-5xl font-extrabold text-slate-900">
              {average ? average.toFixed(1) : "0.0"}
            </span>
            <span className="text-slate-400 font-semibold text-lg">/ 5.0</span>
          </div>

          <div className="mt-2">
            <Rating value={average ?? 0} size="md" />
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Based on {allReviews.length} verified {allReviews.length === 1 ? "review" : "reviews"}
          </p>

          <div className="mt-6">
            {!showForm && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Write a Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Rating Bars Breakdown */}
        <div className="lg:col-span-8 space-y-2.5 max-w-md mx-auto lg:max-w-none w-full">
          {ratingDistribution.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold text-slate-700 shrink-0">
                {star} {star === 1 ? "star" : "stars"}
              </span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-10 text-right text-slate-500 font-medium shrink-0">
                {percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review Collapsible Form */}
      {showForm && (
        <div className="mt-8 p-6 bg-slate-50/70 rounded-3xl border border-slate-200/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-600" />
              Write Your Review
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
              <p className="text-sm text-slate-600">
                Please sign in to share your verified review with fellow shoppers.
              </p>
              <Link
                href="/login"
                className="inline-block px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Sign In to Review
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-3">
                  <Rating
                    value={rating}
                    onChange={setRating}
                    interactive={true}
                    size="lg"
                  />
                  <span className="text-sm font-bold text-amber-600">
                    {ratingLabels[rating] || ""}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Your Review Comment
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell other shoppers what you liked or how this product fit your needs..."
                  className="w-full p-3.5 text-sm bg-white border border-slate-300 rounded-2xl outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all text-slate-900"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Review</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {message && (
        <div
          className={`mt-6 p-4 rounded-2xl text-xs font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : "⚠️"}
          <span>{message.text}</span>
        </div>
      )}

      {/* Reviews List */}
      <div className="mt-8">
        {allReviews.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No reviews yet</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Be the first to share your experience with this item!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 space-y-6">
            {allReviews.map((review) => {
              const authorName = review.user?.name || "Meba Shopper";
              const initial = authorName.charAt(0).toUpperCase();
              const dateStr = new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <article key={review.id} className="pt-6 first:pt-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{authorName}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{dateStr}</span>
                      </div>
                    </div>

                    <Rating value={review.rating} size="sm" />
                  </div>

                  {review.comment && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-12 mt-1">
                      {review.comment}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
