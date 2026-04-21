"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="admin-topbar">
      <div className="admin-topbar__inner">
        <div className="admin-topbar__brand">
          <div className="admin-topbar__logo">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="admin-topbar__eyebrow">Admin Workspace</p>
            <strong>Meba Control Panel</strong>
          </div>
        </div>

        <nav className="admin-topbar__nav">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/admin"
              ? pathname === link.href
              : pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-topbar__link ${isActive ? "is-active" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-topbar__actions">
          <div className="admin-topbar__user">
            <span className="admin-topbar__user-label">Signed in as</span>
            <strong>{user?.name ?? "Admin"}</strong>
          </div>
          <button type="button" className="admin-topbar__logout" onClick={() => void handleLogout()}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
