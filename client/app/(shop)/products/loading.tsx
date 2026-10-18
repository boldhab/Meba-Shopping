import { ProductSkeleton } from "@/components/ui/ProductSkeleton";

export default function ProductsLoading() {
  return (
    <div className="w-full px-6 md:px-12 lg:px-20 py-8">
      {/* Header skeleton */}
      <div className="mb-8 space-y-2 animate-pulse">
        <div className="w-48 h-8 rounded-lg bg-slate-200" />
        <div className="w-80 h-4 rounded bg-slate-100" />
      </div>

      <ProductSkeleton count={8} />
    </div>
  );
}
