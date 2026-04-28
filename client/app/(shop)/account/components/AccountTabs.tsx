"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchUnreadMessageCount, listenForAccountStoreUpdates } from "@/lib/api/account";
import { useAuth } from "@/lib/hooks/useAuth";

const tabs = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/messages", label: "Messages" },
  { href: "/account/settings", label: "Settings" },
];

export function AccountTabs() {
  const { token } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      if (!token) {
        if (isMounted) setUnreadCount(0);
        return;
      }

      try {
        const count = await fetchUnreadMessageCount(token);
        if (isMounted) setUnreadCount(count);
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    };

    void refresh();

    const unsubscribe = listenForAccountStoreUpdates(() => {
      void refresh();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [token]);

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
            {tab.href === "/account/messages" && unreadCount > 0 ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs ${
                  isActive ? "bg-white text-orange-600" : "bg-orange-500 text-white"
                }`}
              >
                {unreadCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
