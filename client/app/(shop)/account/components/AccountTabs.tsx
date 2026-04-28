"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ACCOUNT_UNREAD_MESSAGES = 3;

const tabs = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/messages", label: "Messages" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-amber-100 bg-white/90 p-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-amber-50 text-slate-700 hover:bg-amber-100"
            }`}
          >
            <span>{tab.label}</span>
            {tab.href === "/account/messages" && ACCOUNT_UNREAD_MESSAGES > 0 ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white text-orange-600" : "bg-orange-500 text-white"
                }`}
              >
                {ACCOUNT_UNREAD_MESSAGES}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
