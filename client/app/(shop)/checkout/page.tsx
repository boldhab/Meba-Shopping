import { CheckoutForm } from "./components/CheckoutForm";
import { OrderSummary } from "./components/OrderSummary";
import { PaymentMethod } from "./components/PaymentMethod";
import { ShippingDetails } from "./components/ShippingDetails";

export default function CheckoutPage() {
  return (
    <section className="page-stack">
      <h1>Checkout</h1>
      <CheckoutForm />
      <ShippingDetails />
      <PaymentMethod />
      <OrderSummary />
    </section>
  );
}
