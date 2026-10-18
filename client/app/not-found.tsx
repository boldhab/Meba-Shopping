import Link from "next/link";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-widest font-bold text-orange-600 mb-2">
          404 Error
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          The page or product you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-xs hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Storefront
        </Link>
      </div>
    </div>
  );
}
