import { AdminGuard } from "@/components/admin/AdminGuard";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminGuard>
      <div className="min-h-[calc(100vh-64px)] bg-slate-50/60 pb-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <Sidebar />
            <div className="flex-1 w-full min-w-0">{children}</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
