"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  Flame,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  FolderTree,
  Ticket,
  Star,
  ExternalLink,
} from "lucide-react";
import { getAdminOverview, type AdminOverview } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

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

function getStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "DELIVERED":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PROCESSING":
    case "PAID":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "CANCELLED":
    case "REFUNDED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

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

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-16 bg-white rounded-2xl border border-slate-200/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Loading admin intelligence...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-center">
        <p className="font-bold text-base">Restricted Access</p>
        <p className="text-sm mt-1">Administrator privileges are required to access this dashboard.</p>
      </div>
    );
  }

  const safeOverview = overview ?? emptyOverview;

  const statCards = [
    {
      label: "Total Orders",
      value: safeOverview.stats.totalOrders,
      icon: ShoppingBag,
      href: "/admin/orders",
      gradient: "from-blue-600 to-indigo-600",
      bgSoft: "bg-blue-50 text-blue-600",
    },
    {
      label: "Live Catalog",
      value: safeOverview.stats.totalProducts,
      icon: Package,
      href: "/admin/products",
      gradient: "from-emerald-600 to-teal-600",
      bgSoft: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active Deals",
      value: safeOverview.stats.activeDeals,
      icon: Flame,
      href: "/admin/deals",
      gradient: "from-orange-500 to-amber-500",
      bgSoft: "bg-orange-50 text-orange-600",
    },
    {
      label: "Total Users",
      value: safeOverview.stats.totalUsers,
      icon: Users,
      href: "/admin/users",
      gradient: "from-purple-600 to-violet-600",
      bgSoft: "bg-purple-50 text-purple-600",
    },
    {
      label: "Low Stock Alert",
      value: safeOverview.stats.lowStockProducts,
      icon: AlertTriangle,
      href: "/admin/products",
      gradient: "from-rose-500 to-red-600",
      bgSoft: safeOverview.stats.lowStockProducts > 0 ? "bg-rose-100 text-rose-700 animate-pulse" : "bg-slate-100 text-slate-600",
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      desc: "Create and publish catalog item",
      href: "/admin/products",
      icon: Package,
      accent: "hover:border-blue-500/50 hover:bg-blue-50/20",
    },
    {
      title: "Manage Categories",
      desc: "Organize taxonomy & departments",
      href: "/admin/categories",
      icon: FolderTree,
      accent: "hover:border-emerald-500/50 hover:bg-emerald-50/20",
    },
    {
      title: "Coupons & Promos",
      desc: "Discount codes & campaign rules",
      href: "/admin/coupons",
      icon: Ticket,
      accent: "hover:border-purple-500/50 hover:bg-purple-50/20",
    },
    {
      title: "Moderate Reviews",
      desc: "Customer ratings & feedback",
      href: "/admin/reviews",
      icon: Star,
      accent: "hover:border-amber-500/50 hover:bg-amber-50/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <span>Enterprise Control Center</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time catalog oversight, commercial transactions, and customer growth telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
          >
            <span>Orders Flow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium">
          {error}
        </div>
      )}

      {/* 5-Metric Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.bgSoft}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{card.value}</span>
                <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  View <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid: 2-Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Orders Stream + Quick Actions */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">Commercial transactions logged in real time.</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all orders</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {safeOverview.recentOrders.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {safeOverview.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                        {order.user.name ? order.user.name.slice(0, 2).toUpperCase() : "OR"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            Order #{order.id.slice(0, 8)}
                          </Link>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.user.name ?? order.user.email} • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm font-black text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </strong>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="block text-[11px] font-semibold text-blue-600 hover:underline mt-0.5"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No orders recorded yet. As customers check out, transactions will stream here.
              </div>
            )}
          </div>

          {/* Quick Management Actions Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h2 className="text-base font-bold text-slate-900 mb-1">Operational Workflows</h2>
            <p className="text-xs text-slate-500 mb-4">Direct shortcuts to high-frequency administrative operations.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`p-3.5 rounded-xl border border-slate-200/80 transition-all flex items-start gap-3 ${action.accent}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block">{action.title}</strong>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{action.desc}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Low Stock Alert + Recent Customers */}
        <div className="space-y-6">
          {/* Low Stock Watch */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Low Stock Watch</h2>
              </div>
              <Link href="/admin/products" className="text-xs font-semibold text-blue-600 hover:underline">
                Catalog
              </Link>
            </div>

            {safeOverview.lowStockProducts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {safeOverview.lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-slate-900 truncate">{product.name}</p>
                      <span className="text-[10px] text-slate-400">
                        {product.dealType && product.isDealActive ? `${product.dealType} deal` : "Standard catalog"}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px] shrink-0">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Inventory healthy. No items under critical threshold.
              </div>
            )}
          </div>

          {/* Newest Customer Registrations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">New Registrations</h2>
              </div>
              <Link href="/admin/users" className="text-xs font-semibold text-blue-600 hover:underline">
                Users
              </Link>
            </div>

            {safeOverview.recentUsers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {safeOverview.recentUsers.map((account) => (
                  <div key={account.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 truncate">{account.name ?? "Customer"}</p>
                      <p className="text-[11px] text-slate-500 truncate">{account.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          account.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {account.role}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No user accounts recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
