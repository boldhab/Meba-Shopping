"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrderById, downloadOrderInvoice, type Order } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils/formatPrice";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  Copy,
  Printer,
  Download,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Banknote,
  MapPin,
  Calendar,
} from "lucide-react";

function OrderContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const orderId = (params?.id as string) || "";
  const paymentMethod = searchParams.get("method") || "cod";
  const mobileProvider = searchParams.get("provider") || "telebirr";

  const handleDownloadInvoice = async () => {
    if (!order || !token) return;
    try {
      setDownloadingInvoice(true);
      const blob = await downloadOrderInvoice(order.id, token);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to download invoice: " + (err.message || "Unknown error"));
    } finally {
      setDownloadingInvoice(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push("/login?redirect=/orders/" + orderId);
      return;
    }

    async function fetchOrder() {
      try {
        const data = await getOrderById(orderId, token as string);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, token, authLoading, router]);

  const copyToClipboard = (text: string, type: "id" | "ref") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">{error || "We couldn't retrieve this order. Please verify your order ID."}</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/products"
              className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              href="/account/orders"
              className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine timeline steps
  const steps = [
    { key: "placed", label: "Order Placed", desc: "Received & logged", icon: Clock, done: true },
    {
      key: "confirmed",
      label: "Confirmed",
      desc: paymentMethod === "cod" ? "Awaiting delivery" : "Payment verified",
      icon: CheckCircle2,
      done: order.status !== "PENDING" || paymentMethod === "cod",
    },
    {
      key: "packed",
      label: "Packed",
      desc: "Ready at fulfillment",
      icon: Package,
      done: ["PACKED", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      key: "delivery",
      label: "Out for Delivery",
      desc: "Courier dispatched",
      icon: Truck,
      done: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
  ];

  const subtotal = order.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const isFreeShipping = subtotal >= 1000;
  const shippingFee = isFreeShipping ? 0 : 100;
  const formattedOrderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const referenceCode = order.id.slice(0, 8).toUpperCase();

  return (
    <section className="max-w-4xl mx-auto py-10 px-4 sm:px-6">
      {/* Top Banner */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-200">
                Order Placed Successfully
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                Thank You for Your Order!
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                A confirmation has been recorded and our team is preparing your package.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-75"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingInvoice ? "Generating..." : "Download Invoice (PDF)"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* Order Reference Bar */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-200">Order ID:</span>
            <code className="font-mono font-bold bg-white/15 px-2.5 py-1 rounded-lg text-white text-xs tracking-wider">
              {order.id}
            </code>
            <button
              onClick={() => copyToClipboard(order.id, "id")}
              className="p-1 hover:bg-white/20 rounded-md transition-colors text-white"
              title="Copy Order ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-4 text-emerald-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedOrderDate}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Verified Transaction
            </span>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">
          Order Status & Tracking
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                    step.done
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900">{step.label}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items and Payment Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Method Specific Instructions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              Payment Instructions
            </h2>

            {paymentMethod === "cod" && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full">
                      Pay on Arrival
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Please keep <strong className="text-slate-900">{formatPrice(order.totalAmount)}</strong> in Ethiopian Birr ready for our courier. Our delivery agent will issue an official stamped physical receipt upon payment handoff.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === "mobile" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Mobile Money Transfer</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-full">
                        Pending Verification
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Please send <strong className="text-slate-900">{formatPrice(order.totalAmount)}</strong> to one of our verified merchant accounts below. Include your payment reference note.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    mobileProvider === "telebirr"
                      ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-200"
                      : "border-slate-200 bg-slate-50/50"
                  }`}>
                    <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">Option 1: Telebirr</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">889922</p>
                    <p className="text-[11px] text-slate-500">Meba Supermarket Super-App</p>
                  </div>
                  <div className={`p-3.5 rounded-xl border transition-all ${
                    mobileProvider === "cbebirr"
                      ? "border-purple-600 bg-purple-50/70 ring-2 ring-purple-200"
                      : "border-slate-200 bg-slate-50/50"
                  }`}>
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Option 2: Commercial Bank of Ethiopia</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5 font-mono">100029384756</p>
                    <p className="text-[11px] text-slate-500">Meba Retail SC</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500">Transfer Reference Code: </span>
                    <strong className="font-mono text-slate-900 font-bold ml-1">{referenceCode}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(referenceCode, "ref")}
                    className="flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    {copiedRef ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Credit / Debit Card</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full">
                      Authorized
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your card transaction has been securely processed via 256-bit SSL encryption. An electronic invoice receipt has been registered.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ordered Items List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Items in this Shipment ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product?.name || "Product image"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {item.product?.name || "Item"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> &times; {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address and Cost Breakdown */}
        <div className="space-y-6">
          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              Delivery Destination
            </h2>
            <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">{order.shippingName || "Customer"}</p>
              <p>{order.shippingAddress || "Standard Delivery Address"}</p>
              <p>
                {order.shippingCity || "Addis Ababa"}
                {order.shippingZip ? `, ${order.shippingZip}` : ""}
              </p>
              <p className="font-medium text-slate-700">{order.shippingCountry || "Ethiopia"}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
                Estimated Delivery: 24–48 Hours
              </span>
            </div>
          </div>

          {/* Cost Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">
              Payment Summary
            </h2>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {isFreeShipping ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-sm">Total Amount</span>
                <span className="text-xl font-extrabold text-orange-600">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Link
              href="/account/orders"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>View in Order History</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Preparing your order details...</p>
        </div>
      }
    >
      <OrderContent />
    </Suspense>
  );
}
