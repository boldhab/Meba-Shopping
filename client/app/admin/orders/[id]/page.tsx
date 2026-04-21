"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminOrder, type AdminOrder } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const { token, user, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!token || !isAuthenticated || user?.role !== "ADMIN") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminOrder(token, params.id);
        setOrder(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load order.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder();
  }, [token, isAuthenticated, user?.role, params.id]);

  return (
    <section className="page-stack">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1>Admin order</h1>
          <p className="products-page__description">Review customer, status, and line-item details.</p>
        </div>
        <Link href="/admin/orders" className="admin-dashboard__inline-link">Back to orders</Link>
      </div>

      {isLoading ? <div className="panel">Loading order...</div> : null}
      {error ? <div className="panel text-[#b42318]">{error}</div> : null}

      {order ? (
        <>
          <div className="admin-dashboard__stats">
            <article className="admin-dashboard__stat-card">
              <p className="admin-dashboard__stat-label">Order ID</p>
              <strong className="admin-dashboard__stat-value" style={{ fontSize: "1.1rem" }}>{order.id.slice(0, 16)}</strong>
            </article>
            <article className="admin-dashboard__stat-card">
              <p className="admin-dashboard__stat-label">Status</p>
              <strong className="admin-dashboard__stat-value" style={{ fontSize: "1.1rem" }}>{order.status}</strong>
            </article>
            <article className="admin-dashboard__stat-card">
              <p className="admin-dashboard__stat-label">Total</p>
              <strong className="admin-dashboard__stat-value" style={{ fontSize: "1.1rem" }}>{formatPrice(order.totalAmount)}</strong>
            </article>
          </div>

          <div className="admin-dashboard__grid">
            <section className="panel admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div>
                  <h2 className="m-0">Line items</h2>
                  <p className="m-0 text-sm text-(--color-muted)">Products included in this order.</p>
                </div>
              </div>

              <div className="admin-dashboard__list">
                {order.items.map((item) => (
                  <article key={item.id} className="admin-dashboard__list-item">
                    <div>
                      <strong>{item.product.name}</strong>
                      <p>{item.quantity} unit{item.quantity === 1 ? "" : "s"}</p>
                    </div>
                    <div className="text-right">
                      <strong>{formatPrice(item.unitPrice * item.quantity)}</strong>
                      <p>{formatPrice(item.unitPrice)} each</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div>
                  <h2 className="m-0">Customer</h2>
                  <p className="m-0 text-sm text-(--color-muted)">Who placed this order.</p>
                </div>
              </div>

              <div className="admin-dashboard__list-item">
                <div>
                  <strong>{order.user.name ?? "Unnamed user"}</strong>
                  <p>{order.user.email}</p>
                </div>
                <div className="text-right">
                  <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                  <p>Placed on</p>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
