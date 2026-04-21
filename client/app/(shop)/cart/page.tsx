import { CartItems } from "./components/CartItems";
import { CartSummary } from "./components/CartSummary";
import { CouponInput } from "./components/CouponInput";

export default function CartPage() {
  return (
    <section className="page-stack gap-5">
      <div className="overflow-hidden rounded-[28px] border border-[#ffd2c7] bg-[linear-gradient(135deg,#ff5a36_0%,#ff7a00_52%,#fff0e8_52%,#fff7f2_100%)] shadow-[0_22px_60px_rgba(255,106,0,0.18)]">
        <div className="grid gap-6 px-5 py-6 md:px-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
          <div className="grid gap-3 text-white">
            <span className="w-fit rounded-full bg-white/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]">
              Super deals cart
            </span>
            <div className="grid gap-2">
              <h1 className="m-0 text-3xl font-bold leading-tight md:text-4xl">Almost yours. Lock in today&apos;s best marketplace prices.</h1>
              <p className="m-0 max-w-2xl text-sm text-white/88 md:text-base">
                Review your items, stack a coupon, and head to checkout before the current offer window closes.
              </p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[24px] bg-white/88 p-4 text-[#7a2e00] backdrop-blur md:min-w-[260px]">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[#ff5a36]">Buyer perks</p>
              <p className="m-0 mt-1 text-sm text-[#8a4c23]">Free shipping, quick support, and secure payment protection.</p>
            </div>
            <div className="grid gap-2 text-sm font-medium">
              <span className="rounded-full bg-[#fff1ea] px-3 py-2">Flash picks updated in your bag</span>
              <span className="rounded-full bg-[#fff1ea] px-3 py-2">Coupons apply instantly at checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_360px] lg:items-start">
        <div className="grid gap-4">
          <CartItems />
          <CouponInput />
        </div>
        <CartSummary />
      </div>
    </section>
  );
}
