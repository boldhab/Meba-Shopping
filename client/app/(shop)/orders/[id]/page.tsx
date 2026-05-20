"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrderById, type Order } from "@/lib/api/orders";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      router.push("/login?redirect=/orders/" + params.id);
      return;
    }

    async function fetchOrder() {
      try {
        const data = await getOrderById(params.id as string, token as string);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [params.id, token, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || "Order not found."}</p>
          <Link href="/products" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center mb-8">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been placed.</p>
        <p className="font-mono bg-gray-100 p-2 rounded inline-block mt-4 text-sm">
          Order ID: {order.id}
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 border-b pb-4">Order Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h3>
            <p className="text-gray-900">{order.shippingName}</p>
            <p className="text-gray-600">{order.shippingAddress}</p>
            <p className="text-gray-600">{order.shippingCity}, {order.shippingZip}</p>
            <p className="text-gray-600">{order.shippingCountry}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
              {order.status}
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Items</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {item.product?.imageUrl && (
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.product?.name || "Unknown Product"}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="font-semibold">
                  {formatPrice(item.unitPrice * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-6 pt-6 flex justify-between items-center text-xl font-bold">
          <span>Total Amount</span>
          <span className="text-blue-600">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/products" className="text-blue-600 hover:underline font-medium">
          &larr; Continue Shopping
        </Link>
      </div>
    </section>
  );
}
