"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { addCartItem } from "@/lib/api/cart";
import {
  cancelAccountOrder,
  fetchAccountOrders,
  returnAccountOrder,
  type AccountOrder,
} from "@/lib/api/account";

type OrderStatusFilter = "All" | AccountOrder["orderStatus"];

function money(value: number) {
  return `${value.toLocaleString()} ETB`;
}

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (!token) {
        if (isMounted) {
          setOrders([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const result = await fetchAccountOrders(token);
        if (isMounted) setOrders(result.items);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        order.id.toLowerCase().includes(q) ||
        order.items.some((item) => item.productName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;

      const orderDate = new Date(order.orderDateTime);
      const start = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
      const end = toDate ? new Date(`${toDate}T23:59:59`) : null;
      const matchesFrom = !start || orderDate >= start;
      const matchesTo = !end || orderDate <= end;

      return matchesSearch && matchesStatus && matchesFrom && matchesTo;
    });
  }, [search, statusFilter, fromDate, toDate, orders]);

  const syncOrder = (nextOrder: AccountOrder | null) => {
    if (!nextOrder) return;
    setOrders((prev) => prev.map((order) => (order.id === nextOrder.id ? nextOrder : order)));
  };

  const cancelOrder = async (orderId: string) => {
    if (!token) return;
    const next = await cancelAccountOrder(token, orderId);
    syncOrder(next);
  };

  const returnOrder = async (orderId: string) => {
    if (!token) return;
    const next = await returnAccountOrder(token, orderId);
    syncOrder(next);
  };

  const buyAgain = async (order: AccountOrder) => {
    for (const item of order.items) {
      await addCartItem(
        {
          productId: item.id,
          slug: item.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: item.productName,
          price: item.unitPrice,
          quantity: item.quantity,
          stock: 10,
          imageUrl: item.thumbnail,
        },
        token
      );
    }
    alert(`Added items from ${order.id} to cart.`);
  };

  return (
    <section className="page-stack gap-4">
      <header className="rounded-2xl border border-amber-100 bg-white p-4">
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Search and filter by order number, status, and date range.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatusFilter)}
            title="Filter by order status"
            aria-label="Filter by order status"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Canceled</option>
            <option>Returned</option>
          </select>
          <input
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            type="date"
            title="From date"
            aria-label="From date"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
          <input
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            type="date"
            title="To date"
            aria-label="To date"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">No orders match your filters.</div>
      ) : (
        filteredOrders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order number</p>
                <Link href={`/account/orders/${order.id}`} className="text-lg font-bold text-orange-600 hover:text-orange-700">
                  #{order.id}
                </Link>
                <p className="mt-1 text-sm text-slate-600">{new Date(order.orderDateTime).toLocaleString()}</p>
              </div>

              <div className="grid gap-1 text-sm">
                <p>
                  <span className="font-semibold text-slate-800">Order status:</span> {order.orderStatus}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Payment status:</span> {order.paymentStatus}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Total paid:</span> {money(order.amountPaid)}
                </p>
                <p className="text-xs text-slate-500">Includes tax {money(order.tax)} and shipping {money(order.shipping)}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-slate-800">Items summary</p>
              <div className="grid gap-2 md:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
                    <img src={item.thumbnail} alt={item.productName} className="h-12 w-12 rounded-md border border-slate-200 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{item.productName}</p>
                      <p className="text-xs text-slate-600">Qty {item.quantity} x {money(item.unitPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/account/orders/${order.id}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                View order details
              </Link>

              <a
                href={order.trackingUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${order.trackingUrl ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "cursor-not-allowed border-slate-100 text-slate-300"}`}
              >
                Track shipment
              </a>

              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Download invoice (PDF)
              </button>

              <button disabled={!order.canCancel} onClick={() => void cancelOrder(order.id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${order.canCancel ? "bg-red-500 text-white hover:bg-red-600" : "cursor-not-allowed bg-red-100 text-red-300"}`}>
                Cancel order
              </button>

              <button disabled={!order.canReturn} onClick={() => void returnOrder(order.id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${order.canReturn ? "bg-blue-500 text-white hover:bg-blue-600" : "cursor-not-allowed bg-blue-100 text-blue-300"}`}>
                Return or exchange
              </button>

              <button onClick={() => buyAgain(order)} className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
                Buy again
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
