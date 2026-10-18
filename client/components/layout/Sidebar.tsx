"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  Flame,
  ShoppingBag,
  ShoppingCart,
  Ticket,
  Star,
  HelpCircle,
  Users,
  Settings,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

type NavGroup = {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
};

const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/deals", label: "Deals & Sales", icon: Flame },
    ],
  },
  {
    title: "Orders & Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/admin/cart", label: "Abandoned Carts", icon: ShoppingCart },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "Customer Care",
    items: [
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/qa", label: "Q&A Moderation", icon: HelpCircle },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/users", label: "Users & Staff", icon: Users },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
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
    <aside className="w-full lg:w-64 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col gap-6 sticky top-20">
      {/* Navigation Groups */}
      <nav className="flex flex-col gap-5">
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <span className="block px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {group.title}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          active ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System Status Pill */}
      <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium">All systems green</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
      </div>
    </aside>
  );
}
