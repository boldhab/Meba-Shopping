"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminUser, type AdminUserDetail } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const { token, user, isAuthenticated } = useAuth();
  const [account, setAccount] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      if (!token || !isAuthenticated || user?.role !== "ADMIN") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminUser(token, params.id);
        setAccount(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load user.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [token, isAuthenticated, user?.role, params.id]);

  return (
    <section className="page-stack">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1>User details</h1>
          <p className="products-page__description">Account summary and latest order activity.</p>
        </div>
        <Link href="/admin/users" className="admin-dashboard__inline-link">Back to users</Link>
      </div>

      {isLoading ? <div className="panel">Loading user...</div> : null}
      {error ? <div className="panel text-[#b42318]">{error}</div> : null}

      {account ? (
        <>
          <div className="admin-dashboard__stats">
            <article className="admin-dashboard__stat-card">
              <p className="admin-dashboard__stat-label">Role</p>
              <strong className="admin-dashboard__stat-value" style={{ fontSize: "1.1rem" }}>{account.role}</strong>
            </article>
            <article className="admin-dashboard__stat-card">
              <p className="admin-dashboard__stat-label">Orders</p>
              <strong className="admin-dashboard__stat-value" style={{ fontSize: "1.1rem" }}>{account.orderCount}</strong>
            </article>
            <article className="admin-dashboard__stat-card">
              <p className="admin-dashboard__stat-label">Reviews</p>
              <strong className="admin-dashboard__stat-value" style={{ fontSize: "1.1rem" }}>{account.reviewCount}</strong>
            </article>
          </div>

          <div className="admin-dashboard__grid">
            <section className="panel admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div>
                  <h2 className="m-0">Account</h2>
                  <p className="m-0 text-sm text-(--color-muted)">Basic profile and membership information.</p>
                </div>
              </div>

              <div className="admin-dashboard__list-item">
                <div>
                  <strong>{account.name ?? "Unnamed user"}</strong>
                  <p>{account.email}</p>
                </div>
                <div className="text-right">
                  <strong>{new Date(account.createdAt).toLocaleDateString()}</strong>
                  <p>Joined</p>
                </div>
              </div>
            </section>

            <section className="panel admin-dashboard__section">
              <div className="admin-dashboard__section-header">
                <div>
                  <h2 className="m-0">Recent orders</h2>
                  <p className="m-0 text-sm text-(--color-muted)">Latest orders placed by this user.</p>
                </div>
              </div>

              {account.recentOrders.length ? (
                <div className="admin-dashboard__list">
                  {account.recentOrders.map((order) => (
                    <article key={order.id} className="admin-dashboard__list-item">
                      <div>
                        <strong>{order.status}</strong>
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <strong>{formatPrice(order.totalAmount)}</strong>
                        <p>{order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="m-0 text-sm text-(--color-muted)">This user has not placed any orders yet.</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}
