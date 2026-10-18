import React from "react";

export function ProductSkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse">
      {/* Media skeleton */}
      <div className="relative w-full aspect-square bg-slate-100 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-200/70" />
        <div className="absolute top-3 left-3 w-16 h-5 rounded-full bg-slate-200/80" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <div className="w-20 h-3 rounded bg-slate-200/80" />
        <div className="w-full h-4 rounded bg-slate-200" />
        <div className="w-3/4 h-4 rounded bg-slate-200" />

        {/* Rating skeleton */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-24 h-3.5 rounded bg-slate-200/70" />
          <div className="w-8 h-3 rounded bg-slate-200/50" />
        </div>

        {/* Footer skeleton */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="w-20 h-5 rounded bg-slate-200" />
          <div className="w-16 h-7 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductSkeletonCard key={index} />
      ))}
    </div>
  );
}
