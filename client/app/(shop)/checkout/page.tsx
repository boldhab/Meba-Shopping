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
import { PaymentMethod, type PaymentMethodType } from "./components/PaymentMethod";
import { useAuth } from "@/lib/hooks/useAuth";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

export default function CheckoutPage() {
  const { token, user } = useAuth();
  const { checkoutAllowed, clearCart } = useCart();
  const router = useRouter();

  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    shippingName: user?.name || "",
    shippingAddress: "",
    shippingCity: "Addis Ababa",
    shippingZip: "",
    shippingCountry: "Ethiopia",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("cod");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState<"telebirr" | "cbebirr">("telebirr");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment intent state for Stripe card payments
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!token) {
        throw new Error("Please sign in or create an account to complete your checkout.");
      }

      if (!checkoutAllowed) {
        throw new Error("Your cart is empty or requires attention before proceeding.");
      }

      if (paymentMethod === "mobile" && !mobileNumber.trim()) {
        throw new Error("Please enter your mobile payment phone number.");
      }

      // 1. Create Order in database
      const mappedPaymentMethod = paymentMethod === "cod" ? "COD" : paymentMethod === "mobile" ? "MOBILE" : "CARD";
      const order = await createOrder({ ...shippingDetails, paymentMethod: mappedPaymentMethod }, token);
      setOrderId(order.id);

      // 2. Handle payment dispatch based on chosen method
      if (paymentMethod === "card") {
        try {
          const { clientSecret: secret } = await requestApi<{ clientSecret: string }>(
            "/payments/create-intent",
            {
              method: "POST",
              token,
              body: { orderId: order.id },
            }
          );
          setClientSecret(secret);
        } catch {
          // If Stripe is not configured or in sandbox mock, proceed gracefully
          router.push(`/orders/${order.id}?status=placed&method=card`);
        }
      } else if (paymentMethod === "mobile") {
        try {
          await requestApi("/payments/mobile-intent", {
            method: "POST",
            token,
            body: {
              orderId: order.id,
              provider: mobileProvider,
              mobileNumber: mobileNumber.trim(),
            },
          });
        } catch {
          // Proceed with created order reference
        }
        await clearCart();
        router.push(`/orders/${order.id}?status=placed&method=mobile&provider=${mobileProvider}`);
      } else {
        // Cash on delivery
        await clearCart();
        router.push(`/orders/${order.id}?status=placed&method=cod`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process order. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getSubmitButtonText = () => {
    if (loading) return "Processing your order...";
    if (paymentMethod === "card") return "Continue to Card Payment";
    if (paymentMethod === "mobile") return `Place Order with ${mobileProvider === "telebirr" ? "Telebirr" : "CBE Birr"}`;
    return "Place Order (Cash on Delivery)";
  };

  return (
    <section className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-orange-600 mb-1 block">
            Secure Checkout
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Complete Your Order</h1>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 border border-rose-200 text-sm font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {!clientSecret ? (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Shipping Details Card */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
                <h2 className="text-lg font-bold mb-4 text-slate-900">1. Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      name="shippingName"
                      value={shippingDetails.shippingName}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      placeholder="e.g. Abebe Bikila"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address / House No. *
                    </label>
                    <input
                      required
                      type="text"
                      name="shippingAddress"
                      value={shippingDetails.shippingAddress}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      placeholder="e.g. Bole Sub-city, Woreda 03, House 452"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region *</label>
                    <input
                      required
                      type="text"
                      name="shippingCity"
                      value={shippingDetails.shippingCity}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      placeholder="Addis Ababa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Postal Code (Optional)</label>
                    <input
                      type="text"
                      name="shippingZip"
                      value={shippingDetails.shippingZip}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      placeholder="1000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                    <input
                      required
                      type="text"
                      name="shippingCountry"
                      value={shippingDetails.shippingCountry}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      placeholder="Ethiopia"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <PaymentMethod
                selectedMethod={paymentMethod}
                onSelectMethod={setPaymentMethod}
                mobileNumber={mobileNumber}
                onMobileNumberChange={setMobileNumber}
                mobileProvider={mobileProvider}
                onMobileProviderChange={setMobileProvider}
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !checkoutAllowed}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl transition-all text-base shadow-md hover:shadow-lg flex justify-center items-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{getSubmitButtonText()}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
              <h2 className="text-xl font-bold mb-4 text-slate-900">Card Payment</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm orderId={orderId!} />
              </Elements>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="sticky top-24">
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}
