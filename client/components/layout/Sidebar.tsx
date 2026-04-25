"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/cart", label: "Cart" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <aside className="panel">
      <strong className="mb-3 block">Admin</strong>
      <nav className="space-y-2">
        {links.map((link) => {
          const isActive = isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[#0f5eb8] text-white shadow-[0_10px_20px_rgba(15,94,184,0.16)]"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
