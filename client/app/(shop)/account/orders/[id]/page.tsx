"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { addCartItem } from "@/lib/api/cart";
import { getAccountOrder, updateAccountOrder, type AccountOrder } from "@/lib/api/account";

function money(value: number) {
  return `${value.toLocaleString()} ETB`;
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [order, setOrder] = useState<AccountOrder | null>(() => getAccountOrder(params.id));

  const syncOrder = (nextOrder: AccountOrder | null) => {
    if (!nextOrder) return;
    setOrder(nextOrder);
  };

  const buyAgain = async () => {
    if (!order) return;

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

    window.alert(`Added items from ${order.id} to cart.`);
  };

  const cancelOrder = () => {
    if (!order) return;
    const next = updateAccountOrder(order.id, (current) => ({
      ...current,
      orderStatus: "Canceled",
      paymentStatus: current.paymentStatus === "Paid" ? "Refunded" : current.paymentStatus,
      canCancel: false,
      canReturn: false,
    }));
    syncOrder(next);
  };

  const returnOrder = () => {
    if (!order) return;
    const next = updateAccountOrder(order.id, (current) => ({
      ...current,
      orderStatus: "Returned",
      canCancel: false,
      canReturn: false,
    }));
    syncOrder(next);
  };

  if (!order) {
    return (
      <section className="page-stack rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="text-2xl font-bold text-slate-900">Order not found</h1>
        <p className="text-sm text-slate-600">This order does not exist in your local account data yet.</p>
        <Link href="/account/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
          Back to My Orders
        </Link>
      </section>
    );
  }

  return (
    <section className="page-stack gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-bold text-slate-900">Order #{order.id}</h1>
        <p className="mt-1 text-sm text-slate-600">Placed on {new Date(order.orderDateTime).toLocaleString()}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Status: {order.orderStatus}</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Payment: {order.paymentStatus}</span>
        </div>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p>Subtotal: {money(order.amountPaid - order.tax - order.shipping)}</p>
          <p>Tax: {money(order.tax)}</p>
          <p>Shipping: {money(order.shipping)}</p>
          <p className="font-bold text-slate-900">Total paid: {money(order.amountPaid)}</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-800">Shipping address</p>
            <p className="text-sm text-slate-600">Bole Road, House 12, Addis Ababa</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-3">
            <p className="text-sm font-semibold text-slate-800">Billing address</p>
            <p className="text-sm text-slate-600">Bole Road, House 12, Addis Ababa</p>
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
          <a href={order.trackingUrl ?? "#"} target="_blank" rel="noopener noreferrer" className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${order.trackingUrl ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "cursor-not-allowed border-slate-100 text-slate-300"}`}>
            Track shipment
          </a>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Download invoice (PDF)</button>
          <button disabled={!order.canCancel} onClick={cancelOrder} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${order.canCancel ? "bg-red-500 text-white hover:bg-red-600" : "cursor-not-allowed bg-red-100 text-red-300"}`}>
            Cancel order
          </button>
          <button disabled={!order.canReturn} onClick={returnOrder} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${order.canReturn ? "bg-blue-500 text-white hover:bg-blue-600" : "cursor-not-allowed bg-blue-100 text-blue-300"}`}>
            Return or exchange
          </button>
          <button onClick={buyAgain} className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">
            Buy again
          </button>
        </div>
      </article>

      <Link href="/account/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
        Back to My Orders
      </Link>
    </section>
  );
}
