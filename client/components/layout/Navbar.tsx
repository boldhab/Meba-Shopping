"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="site-header">
      <Link href="/">Meba Shopping</Link>
      <nav className="header-nav">
        <Link href="/products">Products</Link>
        <Link href="/cart">Cart</Link>
        {isAuthenticated ? <Link href="/account">Account</Link> : <Link href="/login">Login</Link>}
        {isAuthenticated ? (
          <button type="button" className="nav-logout" onClick={logout}>
            Logout{user?.name ? ` (${user.name})` : ""}
          </button>
        ) : null}
      </nav>
    </header>
  );
}
