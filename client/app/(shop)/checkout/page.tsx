"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderSummary } from "./components/OrderSummary";
import { createOrder, type ShippingDetails } from "@/lib/api/orders";
import { useCart } from "@/lib/hooks/useCart";
import { requestApi } from "@/lib/api/client";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentForm } from "./components/StripePaymentForm";
import { useAuth } from "@/lib/hooks/useAuth";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

export default function CheckoutPage() {
  const { token, user } = useAuth();
  const { checkoutAllowed } = useCart();
  const router = useRouter();

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    shippingName: user?.name || "",
    shippingAddress: "",
    shippingCity: "",
    shippingZip: "",
    shippingCountry: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment intent state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!token) {
        throw new Error("You must be logged in to checkout.");
      }

      if (!checkoutAllowed) {
        throw new Error("Checkout requirements not met.");
      }

      const order = await createOrder(shippingDetails, token);
      setOrderId(order.id);
      
      const { clientSecret: secret } = await requestApi<{ clientSecret: string }>("/payments/create-intent", {
        method: "POST",
        token,
        body: { orderId: order.id }
      });
      
      setClientSecret(secret);
    } catch (err: any) {
      setError(err.message || "Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!clientSecret ? (
            <form onSubmit={handleSubmitShipping} className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      required
                      type="text"
                      name="shippingName"
                      value={shippingDetails.shippingName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      required
                      type="text"
                      name="shippingAddress"
                      value={shippingDetails.shippingAddress}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="123 Main St, Apt 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      required
                      type="text"
                      name="shippingCity"
                      value={shippingDetails.shippingCity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input
                      required
                      type="text"
                      name="shippingZip"
                      value={shippingDetails.shippingZip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="10001"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      required
                      type="text"
                      name="shippingCountry"
                      value={shippingDetails.shippingCountry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !checkoutAllowed}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg shadow-md flex justify-center items-center"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Continue to Payment"
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Payment Details</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm orderId={orderId!} />
              </Elements>
            </div>
          )}
        </div>

        <div>
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}
