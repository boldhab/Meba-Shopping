"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AccountPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
          <Link className="hero__link" href="/login">
            Login
          </Link>
          <Link className="hero__link" href="/register">
            Create account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-stack gap-5">
      <div className="state-card">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Account dashboard</h1>
        <p className="text-sm text-slate-600">Signed in as {user.name ?? user.email}</p>
        <p className="text-sm text-slate-600">Email: {user.email}</p>
        <p className="text-sm text-slate-600">Role: {user.role}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-amber-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Recently viewed products</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-lg bg-amber-50 px-3 py-2">Ethiopian Coffee Beans - 1kg</li>
            <li className="rounded-lg bg-amber-50 px-3 py-2">Natural Honey - 500g</li>
            <li className="rounded-lg bg-amber-50 px-3 py-2">Whole Wheat Flour - 2kg</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Coupons and offers</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-lg bg-emerald-50 px-3 py-2">MEBA15 - 15% off groceries</li>
            <li className="rounded-lg bg-emerald-50 px-3 py-2">FREESHIP - Free shipping over 1000 ETB</li>
            <li className="rounded-lg bg-emerald-50 px-3 py-2">DAILY5 - 5% daily essentials discount</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-white p-4">
          <h2 className="font-semibold text-slate-900">Returns and refunds</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="rounded-lg bg-sky-50 px-3 py-2">Order #ME-10017 - Return in progress</li>
            <li className="rounded-lg bg-sky-50 px-3 py-2">Order #ME-10004 - Refund completed</li>
          </ul>
        </article>
      </div>

      <article className="rounded-2xl border border-amber-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Support tickets</h2>
          <Link href="/account/messages" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            Open Messages
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Ticket #SUP-4441</p>
            <p className="text-sm text-slate-600">Delayed shipment inquiry - awaiting carrier response.</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Ticket #SUP-4432</p>
            <p className="text-sm text-slate-600">Coupon issue resolved and confirmed by support team.</p>
          </div>
        </div>
      </article>
    </section>
  );
}
