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
    <section className="page-stack state-card">
      <h1>Account dashboard</h1>
      <p>Signed in as {user.name ?? user.email}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </section>
  );
}
