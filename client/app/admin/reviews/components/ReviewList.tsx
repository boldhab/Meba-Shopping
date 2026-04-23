"use client";

import { useEffect, useState } from "react";
import { getAdminReviews, updateAdminReviewStatus, deleteAdminReview, type AdminReview } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";

export function ReviewList() {
  const { token, isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    if (!token || !isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminReviews(token);
      setReviews(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [token, isAuthenticated, user?.role]);

  const handleStatusUpdate = async (reviewId: string, status: "APPROVED" | "REJECTED") => {
    if (!token) return;
    try {
      await updateAdminReviewStatus(token, reviewId, status);
      await loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update review status.");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!token || !confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteAdminReview(token, reviewId);
      await loadReviews();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete review.");
    }
  };

  if (isLoading) return <div className="panel">Loading reviews...</div>;
  if (error) return <div className="panel text-red-600">{error}</div>;

  return (
    <div className="panel overflow-x-auto">
      <div className="mb-4">
        <h2 className="m-0">Customer Reviews</h2>
        <p className="m-0 text-sm text-(--color-muted)">Approve or reject customer reviews before they appear on product pages.</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-(--color-muted)">No reviews found.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Comment</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-3">
                  <div className="font-medium">{review.user.name || "Anonymous"}</div>
                  <div className="text-xs text-(--color-muted)">{review.user.email}</div>
                </td>
                <td className="px-3 py-3">
                   <div className="font-medium">{review.product.name}</div>
                   <div className="text-xs text-(--color-muted)">/{review.product.slug}</div>
                </td>
                <td className="px-3 py-3 font-bold text-yellow-600">{review.rating} / 5</td>
                <td className="px-3 py-3 max-w-xs truncate">{review.comment}</td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    review.status === "APPROVED" ? "bg-green-100 text-green-800" :
                    review.status === "REJECTED" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {review.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    {review.status !== "APPROVED" && (
                      <button onClick={() => handleStatusUpdate(review.id, "APPROVED")} className="text-green-600 text-xs font-bold bg-transparent border-none p-0 cursor-pointer">Approve</button>
                    )}
                    {review.status !== "REJECTED" && (
                      <button onClick={() => handleStatusUpdate(review.id, "REJECTED")} className="text-red-600 text-xs font-bold bg-transparent border-none p-0 cursor-pointer">Reject</button>
                    )}
                    <button onClick={() => handleDelete(review.id)} className="text-slate-400 text-xs bg-transparent border-none p-0 cursor-pointer">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
