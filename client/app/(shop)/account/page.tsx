"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { fetchAccountOrders, fetchAccountSettings, type AccountOrder, type AccountSettings } from "@/lib/api/account";

export default function AccountPage() {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    setDataLoading(true);
    Promise.all([
      fetchAccountOrders(token),
      fetchAccountSettings(token),
    ])
      .then(([ordersRes, settingsRes]) => {
        setOrders(ordersRes.items ?? []);
        setSettings(settingsRes);
      })
      .catch(() => {
        // Silently fail — page still shows user info from auth
      })
      .finally(() => setDataLoading(false));
  }, [token, isAuthenticated]);

  if (isLoading) {
    return (
      <section className="page-stack">
        <h1>Account dashboard</h1>
        <p>Loading your account details...</p>
      </section>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <section className="page-stack state-card">
        <h1>Account dashboard</h1>
        <p>You are currently signed out.</p>
        <div className="hero__actions">
          <Link className="hero__link" href="/login">Login</Link>
          <Link className="hero__link" href="/register">Create account</Link>
        </div>
      </section>
    );
  }

  const recentOrders = orders.slice(0, 3);
  const pendingOrders = orders.filter((o) => o.orderStatus === "Processing" || o.orderStatus === "Pending");
  const returnsOrders = orders.filter((o) => o.orderStatus === "Returned" || o.canReturn);

  return (
    <section className="page-stack gap-5">
      {/* Profile card */}
      <div className="state-card">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Account dashboard</h1>
        <p className="text-sm text-slate-600">Signed in as {settings?.profile.fullName ?? user.name ?? user.email}</p>
        <p className="text-sm text-slate-600">Email: {settings?.profile.email ?? user.email}</p>
        {settings?.profile.phone && (
          <p className="text-sm text-slate-600">Phone: {settings.profile.phone}</p>
        )}
        <p className="text-sm text-slate-600">Role: {user.role}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Orders */}
        <article className="rounded-2xl border border-amber-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Recent orders</h2>
          {dataLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          ) : recentOrders.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {recentOrders.map((order) => (
                <li key={order.id} className="rounded-lg bg-amber-50 px-3 py-2 flex justify-between">
                  <Link href={`/orders/${order.id}`} className="font-medium text-orange-600 hover:underline">
                    #{order.id.slice(-6).toUpperCase()}
                  </Link>
                  <span className="capitalize text-slate-500">{order.orderStatus}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No recent orders.</p>
          )}
          <Link href="/account/orders" className="mt-3 block text-sm font-semibold text-orange-600 hover:text-orange-700">
            View all orders →
          </Link>
        </article>

        {/* Pending shipments */}
        <article className="rounded-2xl border border-amber-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Active shipments</h2>
          {dataLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          ) : pendingOrders.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {pendingOrders.map((order) => (
                <li key={order.id} className="rounded-lg bg-emerald-50 px-3 py-2 flex justify-between">
                  <Link href={`/orders/${order.id}`} className="font-medium text-emerald-700 hover:underline">
                    #{order.id.slice(-6).toUpperCase()}
                  </Link>
                  <span className="text-slate-500">{order.orderStatus}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No active shipments.</p>
          )}
        </article>

        {/* Returns */}
        <article className="rounded-2xl border border-amber-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Returns and refunds</h2>
          {dataLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading...</p>
          ) : returnsOrders.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {returnsOrders.map((order) => (
                <li key={order.id} className="rounded-lg bg-sky-50 px-3 py-2">
                  <Link href={`/orders/${order.id}`} className="font-medium text-sky-700 hover:underline">
                    #{order.id.slice(-6).toUpperCase()}
                  </Link>{" "}
                  — {order.orderStatus}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No returns or refunds.</p>
          )}
        </article>
      </div>

      {/* Support tickets / messages */}
      <article className="rounded-2xl border border-amber-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Messages</h2>
          <Link href="/account/messages" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Open Messages
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Visit your <Link href="/account/messages" className="text-orange-600 hover:underline">messages inbox</Link> to view support conversations and notifications.
        </p>
      </article>
    </section>
  );
}
