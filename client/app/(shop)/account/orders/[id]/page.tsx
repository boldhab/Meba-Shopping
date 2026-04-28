import Link from "next/link";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <section className="page-stack gap-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-4">
        <h1 className="text-2xl font-bold text-slate-900">Order #{params.id}</h1>
        <p className="mt-1 text-sm text-slate-600">Placed on Apr 27, 2026 at 4:40 PM</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Status: Shipped</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Payment: Paid</span>
        </div>
      </header>

      <article className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p>Subtotal: 3,064 ETB</p>
          <p>Tax: 315 ETB</p>
          <p>Shipping: 120 ETB</p>
          <p className="font-bold text-slate-900">Total paid: 3,499 ETB</p>
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

        <div className="mt-4 flex flex-wrap gap-2">
          <a href="https://carrier.example/track" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Track shipment
          </a>
          <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Download invoice (PDF)</button>
          <button className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600">Return or exchange</button>
          <button className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600">Buy again</button>
        </div>
      </article>

      <Link href="/account/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
        Back to My Orders
      </Link>
    </section>
  );
}
