"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
} from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";

export function CouponManager() {
  const { token, isAuthenticated, user } = useAuth();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState<number>(10);
  const [newExpiry, setNewExpiry] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadCoupons = async () => {
    if (!token || !isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await getAdminCoupons(token);
      setCoupons(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load coupons.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, [token, isAuthenticated, user?.role]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newCode.trim()) return;

    setIsCreating(true);
    try {
      await createAdminCoupon(token, {
        code: newCode.trim().toUpperCase(),
        discountPercent: Number(newDiscount),
        expiresAt: newExpiry ? new Date(newExpiry).toISOString() : null,
        isActive: newIsActive,
      });

      setNewCode("");
      setNewDiscount(10);
      setNewExpiry("");
      setNewIsActive(true);
      await loadCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create coupon.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (coupon: AdminCoupon) => {
    if (!token) return;
    try {
      await updateAdminCoupon(token, coupon.id, {
        isActive: !coupon.isActive,
      });
      await loadCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle coupon status.");
    }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    if (!token || !confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;

    try {
      await deleteAdminCoupon(token, coupon.id);
      await loadCoupons();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete coupon.");
    }
  };

  if (isLoading) return <div className="panel">Loading coupons...</div>;
  if (error) return <div className="panel text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Create Coupon Panel */}
      <div className="panel">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Create New Coupon</h2>
        <p className="text-xs text-slate-500 mb-4">
          Create promotional discount codes for checkout. Codes are automatically uppercase.
        </p>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. SAVE20"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Discount % *</label>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={newDiscount}
              onChange={(e) => setNewDiscount(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Expiration Date (Optional)</label>
            <input
              type="date"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isCreating || !newCode.trim()}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? "Creating..." : "+ Add Coupon"}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons List Panel */}
      <div className="panel overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800 m-0">Active & Historical Coupons</h2>
            <p className="text-xs text-slate-500 m-0">Total: {coupons.length} coupons</p>
          </div>
        </div>

        {coupons.length === 0 ? (
          <p className="text-sm text-slate-500">No coupons configured yet. Add your first coupon above.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Discount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Expires</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();

                return (
                  <tr key={coupon.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-3 py-3 font-mono font-bold text-slate-800">{coupon.code}</td>
                    <td className="px-3 py-3">
                      <span className="font-semibold text-emerald-600">{coupon.discountPercent}% OFF</span>
                    </td>
                    <td className="px-3 py-3">
                      {isExpired ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Expired
                        </span>
                      ) : coupon.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {new Date(coupon.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`text-xs font-semibold bg-transparent border-none p-0 cursor-pointer ${
                            coupon.isActive
                              ? "text-amber-600 hover:text-amber-800"
                              : "text-emerald-600 hover:text-emerald-800"
                          }`}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 bg-transparent border-none p-0 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
