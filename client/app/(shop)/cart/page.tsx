import { CartItems } from "./components/CartItems";
import { CartSummary } from "./components/CartSummary";
import { CouponInput } from "./components/CouponInput";

export default function CartPage() {
  return (
    <section className="page-stack">
      <h1>Cart</h1>
      <CartItems />
      <CouponInput />
      <CartSummary />
    </section>
  );
}
