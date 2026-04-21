import { CartItems } from "./components/CartItems";
import { CartSummary } from "./components/CartSummary";
import { CouponInput } from "./components/CouponInput";

export default function CartPage() {
  return (
    <section className="page-stack">
      <div className="grid gap-2">
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-(--color-muted)">Shopping cart</span>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="m-0">Review your bag</h1>
            <p className="m-0 text-sm text-(--color-muted)">
              Adjust quantities, apply a coupon, and move to checkout when everything looks right.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,1fr)] lg:items-start">
        <div className="grid gap-4">
          <CartItems />
          <CouponInput />
        </div>
        <CartSummary />
      </div>
    </section>
  );
}
