"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  fetchAccountOrders,
  fetchAccountSettings,
  fetchWishlistItems,
  fetchUnreadMessageCount,
  type AccountOrder,
  type AccountSettings,
} from "@/lib/api/account";
import { formatPrice } from "@/lib/utils/formatPrice";
import {
  Package,
  Truck,
  Heart,
  MessageSquare,
  Settings,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function AccountPage() {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    setDataLoading(true);
    Promise.all([
      fetchAccountOrders(token).catch(() => ({ items: [] })),
      fetchAccountSettings(token).catch(() => null),
      fetchWishlistItems(token).catch(() => ({ items: [] })),
      fetchUnreadMessageCount(token).catch(() => 0),
    ])
      .then(([ordersRes, settingsRes, wishlistRes, unreadRes]) => {
        setOrders(ordersRes.items ?? []);
        setSettings(settingsRes);
        setWishlistCount(wishlistRes.items?.length ?? 0);
        setUnreadMessages(unreadRes ?? 0);
      })
      .finally(() => setDataLoading(false));
  }, [token, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Customer Account</h1>
          <p className="text-xs text-slate-500 mb-6">
            Sign in to track orders, manage saved items in your wishlist, and update your delivery details.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 4);
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Processing" || o.orderStatus === "Pending"
  );
  const userInitial = (settings?.profile?.fullName || user.name || user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Card Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-orange-600 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
            {userInitial}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {settings?.profile?.fullName || user.name || "Customer"}!
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {settings?.profile?.email || user.email}
              {settings?.profile?.phone ? ` • ${settings.profile.phone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
          <Link
            href="/account/settings"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/account/orders"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{orders.length}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Orders
          </span>
        </Link>

        <Link
          href="/account/orders"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{pendingOrders.length}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Active Deliveries
          </span>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-rose-200 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{wishlistCount}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Saved in Wishlist
          </span>
        </Link>

        <Link
          href="/account/messages"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 block">{unreadMessages}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Unread Messages
          </span>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review your most recent purchases, status, and invoices.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dataLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading your orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No orders placed yet</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Explore our fresh grocery catalog and start your shopping basket.
            </p>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => {
              const statusColors: Record<string, string> = {
                Pending: "bg-amber-50 text-amber-700 border-amber-200",
                Processing: "bg-blue-50 text-blue-700 border-blue-200",
                Shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
                Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
                Canceled: "bg-rose-50 text-rose-700 border-rose-200",
              };

              const badgeColor =
                statusColors[order.orderStatus] || "bg-slate-50 text-slate-700 border-slate-200";

              return (
                <div
                  key={order.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      #{order.id.slice(0, 4).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-orange-600 transition-colors"
                        >
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(order.orderDateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        • {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatPrice(order.amountPaid)}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
