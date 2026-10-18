import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center py-20 px-4">
      <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center gap-3">
        <Spinner size="lg" label="Loading Meba Shopping..." />
      </div>
    </div>
  );
}
