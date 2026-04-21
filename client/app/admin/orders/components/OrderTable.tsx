"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminOrders, type AdminOrder } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

export function OrderTable() {
  const { token, user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!token || !isAuthenticated || user?.role !== "ADMIN") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminOrders(token);
        setOrders(result.items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load orders.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrders();
  }, [token, isAuthenticated, user?.role]);

  if (isLoading) {
    return <div className="panel">Loading orders...</div>;
  }

  if (error) {
    return <div className="panel text-[#b42318]">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="panel">No orders have been placed yet.</div>;
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-3">Order</th>
            <th className="px-3 py-3">Customer</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Items</th>
            <th className="px-3 py-3">Total</th>
            <th className="px-3 py-3">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-slate-100 align-top">
              <td className="px-3 py-3">
                <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[#0f5eb8]">
                  {order.id.slice(0, 12)}
                </Link>
              </td>
              <td className="px-3 py-3">
                <div className="font-medium text-slate-800">{order.user.name ?? "Unnamed user"}</div>
                <div className="text-xs text-slate-500">{order.user.email}</div>
              </td>
              <td className="px-3 py-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {order.status}
                </span>
              </td>
              <td className="px-3 py-3">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </td>
              <td className="px-3 py-3 font-semibold">{formatPrice(order.totalAmount)}</td>
              <td className="px-3 py-3 text-slate-600">{new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
