"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Canceled" | "Returned";
type PaymentStatus = "Paid" | "Unpaid" | "Refunded" | "Failed";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnail: string;
};

type AccountOrder = {
  id: string;
  orderDateTime: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  tax: number;
  shipping: number;
  trackingUrl?: string;
  canCancel: boolean;
  canReturn: boolean;
  items: OrderItem[];
};

const orders: AccountOrder[] = [
  {
    id: "ME-10024",
    orderDateTime: "2026-04-27T16:40:00",
    orderStatus: "Shipped",
    paymentStatus: "Paid",
    amountPaid: 3499,
    tax: 315,
    shipping: 120,
    trackingUrl: "https://carrier.example/track/ME-10024",
    canCancel: false,
    canReturn: true,
    items: [
      { id: "p1", productName: "Premium Coffee Beans", quantity: 2, unitPrice: 620, thumbnail: "https://placehold.co/56x56?text=C" },
      { id: "p2", productName: "Organic Honey", quantity: 1, unitPrice: 450, thumbnail: "https://placehold.co/56x56?text=H" },
    ],
  },
  {
    id: "ME-10017",
    orderDateTime: "2026-04-22T11:20:00",
    orderStatus: "Processing",
    paymentStatus: "Paid",
    amountPaid: 1890,
    tax: 170,
    shipping: 90,
    trackingUrl: "https://carrier.example/track/ME-10017",
    canCancel: true,
    canReturn: false,
    items: [
      { id: "p3", productName: "Brown Rice 5kg", quantity: 1, unitPrice: 890, thumbnail: "https://placehold.co/56x56?text=R" },
      { id: "p4", productName: "Olive Oil 1L", quantity: 1, unitPrice: 640, thumbnail: "https://placehold.co/56x56?text=O" },
    ],
  },
  {
    id: "ME-10004",
    orderDateTime: "2026-03-15T09:05:00",
    orderStatus: "Returned",
    paymentStatus: "Refunded",
    amountPaid: 1220,
    tax: 110,
    shipping: 70,
    canCancel: false,
    canReturn: false,
    items: [
      { id: "p5", productName: "Almond Milk", quantity: 3, unitPrice: 210, thumbnail: "https://placehold.co/56x56?text=M" },
    ],
  },
];

function money(value: number) {
  return `${value.toLocaleString()} ETB`;
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
  }, [search, statusFilter, fromDate, toDate]);

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
            onChange={(e) => setStatusFilter(e.target.value)}
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

      {filteredOrders.length === 0 ? (
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
                rel="noreferrer"
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${order.trackingUrl ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "cursor-not-allowed border-slate-100 text-slate-300"}`}
              >
                Track shipment
              </a>

              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Download invoice (PDF)
              </button>

              <button disabled={!order.canCancel} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${order.canCancel ? "bg-red-500 text-white hover:bg-red-600" : "cursor-not-allowed bg-red-100 text-red-300"}`}>
                Cancel order
              </button>

              <button disabled={!order.canReturn} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${order.canReturn ? "bg-blue-500 text-white hover:bg-blue-600" : "cursor-not-allowed bg-blue-100 text-blue-300"}`}>
                Return or exchange
              </button>

              <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
                Buy again
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
