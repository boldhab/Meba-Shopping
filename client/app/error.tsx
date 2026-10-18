"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-widest font-bold text-rose-600 mb-2">
          Application Error
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          {error.message || "An unexpected error occurred while loading this page. Please try again."}
        </p>
        <button
          onClick={reset}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-semibold shadow-xs hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
