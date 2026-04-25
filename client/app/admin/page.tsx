"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminOverview, type AdminOverview } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

const quickLinks = [
  { href: "/admin/products", label: "Manage products", description: "Create, edit, and review catalog items." },
  { href: "/admin/deals", label: "Manage deals", description: "Launch or update Daily, Weekly, Clearance, and Ceremony deals." },
  { href: "/admin/orders", label: "Review orders", description: "Track order flow and monitor recent activity." },
  { href: "/admin/cart", label: "Cart oversight", description: "Monitor abandoned carts and manage cart rules." },
  { href: "/admin/reviews", label: "Moderate reviews", description: "Approve or reject customer feedback." },
  { href: "/admin/qa", label: "Moderate Q&A", description: "Answer customer inquiries." },
  { href: "/admin/users", label: "View users", description: "Keep an eye on the latest customers and admins." },
];

const statMeta = [
  { key: "totalProducts", label: "Products" },
  { key: "activeDeals", label: "Active deals" },
  { key: "totalUsers", label: "Users" },
  { key: "totalOrders", label: "Orders" },
  { key: "lowStockProducts", label: "Low stock" },
] as const;

const emptyOverview: AdminOverview = {
  stats: {
    totalProducts: 0,
    activeDeals: 0,
    totalUsers: 0,
    totalOrders: 0,
    lowStockProducts: 0,
  },
  lowStockProducts: [],
  recentOrders: [],
  recentUsers: [],
};

export default function AdminPage() {
  const { token, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  useEffect(() => {
    async function loadOverview() {
      if (!token || !isAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const nextOverview = await getAdminOverview(token);
        setOverview(nextOverview);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load admin dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOverview();
  }, [token, isAdmin]);

  const statCards = useMemo(() => {
    const safeOverview = overview?.stats ? overview : emptyOverview;

    return statMeta.map((item) => ({
      label: item.label,
      value: safeOverview.stats[item.key],
    }));
  }, [overview]);

  if (authLoading || isLoading) {
    return <section className="page-stack"><div className="panel">Loading admin dashboard...</div></section>;
  }

  if (!isAdmin) {
    return <section className="page-stack"><div className="panel">Admin access is required to view this dashboard.</div></section>;
  }

  return (
    <section className="page-stack admin-dashboard">
      <div className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">Control center</p>
          <h1 className="m-0">Admin dashboard</h1>
          <p className="admin-dashboard__description">
            Track catalog health, live deals, new users, and recent orders from one place.
          </p>
        </div>
      </div>

      {error ? <div className="panel text-[#b42318]">{error}</div> : null}

      <div className="admin-dashboard__stats">
        {statCards.map((card) => (
          <article key={card.label} className="admin-dashboard__stat-card">
            <p className="admin-dashboard__stat-label">{card.label}</p>
            <strong className="admin-dashboard__stat-value">{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dashboard__grid">
        <div className="admin-dashboard__main">
          <section className="panel admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <div>
                <h2 className="m-0">Quick actions</h2>
                <p className="m-0 text-sm text-(--color-muted)">Jump into the main admin workflows.</p>
              </div>
            </div>

            <div className="admin-dashboard__quick-links">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="admin-dashboard__quick-link">
                  <strong>{link.label}</strong>
                  <span>{link.description}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <div>
                <h2 className="m-0">Recent orders</h2>
                <p className="m-0 text-sm text-(--color-muted)">The latest order activity from the store.</p>
              </div>
              <Link href="/admin/orders" className="admin-dashboard__inline-link">View all</Link>
            </div>

            {(overview?.recentOrders ?? []).length ? (
              <div className="admin-dashboard__list">
                {(overview?.recentOrders ?? []).map((order) => (
                  <article key={order.id} className="admin-dashboard__list-item">
                    <div>
                      <strong>{order.user.name ?? order.user.email}</strong>
                      <p>{order.user.email}</p>
                    </div>
                    <div className="text-right">
                      <strong>{formatPrice(order.totalAmount)}</strong>
                      <p>{order.status}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-(--color-muted)">No orders yet.</p>
            )}
          </section>
        </div>

        <div className="admin-dashboard__side">
          <section className="panel admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <div>
                <h2 className="m-0">Low stock watch</h2>
                <p className="m-0 text-sm text-(--color-muted)">Products that may need attention soon.</p>
              </div>
              <Link href="/admin/products" className="admin-dashboard__inline-link">Manage</Link>
            </div>

            {(overview?.lowStockProducts ?? []).length ? (
              <div className="admin-dashboard__list">
                {(overview?.lowStockProducts ?? []).map((product) => (
                  <article key={product.id} className="admin-dashboard__list-item">
                    <div>
                      <strong>{product.name}</strong>
                      <p>{product.dealType && product.isDealActive ? `${product.dealType} deal active` : "No active deal"}</p>
                    </div>
                    <div className="text-right">
                      <strong>{product.stock}</strong>
                      <p>units left</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-(--color-muted)">No low stock items right now.</p>
            )}
          </section>

          <section className="panel admin-dashboard__section">
            <div className="admin-dashboard__section-header">
              <div>
                <h2 className="m-0">Newest users</h2>
                <p className="m-0 text-sm text-(--color-muted)">Recently created accounts.</p>
              </div>
              <Link href="/admin/users" className="admin-dashboard__inline-link">Open users</Link>
            </div>

            {(overview?.recentUsers ?? []).length ? (
              <div className="admin-dashboard__list">
                {(overview?.recentUsers ?? []).map((account) => (
                  <article key={account.id} className="admin-dashboard__list-item">
                    <div>
                      <strong>{account.name ?? "Unnamed user"}</strong>
                      <p>{account.email}</p>
                    </div>
                    <div className="text-right">
                      <strong>{account.role}</strong>
                      <p>{new Date(account.createdAt).toLocaleDateString()}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="m-0 text-sm text-(--color-muted)">No users found.</p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
