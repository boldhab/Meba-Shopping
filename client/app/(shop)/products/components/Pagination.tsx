"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-8 pb-4">
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-bold text-slate-400 cursor-not-allowed opacity-60"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>
      )}

      <div className="flex items-center px-4 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-semibold text-slate-600">
        Page <span className="font-bold text-slate-900 mx-1">{currentPage}</span> of{" "}
        <span className="font-bold text-slate-900 ml-1">{totalPages}</span>
      </div>

      {currentPage < totalPages ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-bold text-slate-400 cursor-not-allowed opacity-60"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
}
