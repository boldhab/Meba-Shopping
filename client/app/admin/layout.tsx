import { AdminGuard } from "@/components/admin/AdminGuard";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminGuard>
      <div className="admin-shell">
        <Sidebar />
        <div>{children}</div>
      </div>
    </AdminGuard>
  );
}
