"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminUsers, type AdminUser } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AdminUsersPage() {
  const { token, user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      if (!token || !isAuthenticated || user?.role !== "ADMIN") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminUsers(token);
        setUsers(result.items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [token, isAuthenticated, user?.role]);

  return (
    <section className="page-stack">
      <div>
        <h1>Manage users</h1>
        <p className="products-page__description">Track customers, admins, and recent account activity.</p>
      </div>

      {isLoading ? <div className="panel">Loading users...</div> : null}
      {error ? <div className="panel text-[#b42318]">{error}</div> : null}

      {!isLoading && !error ? (
        users.length ? (
          <div className="panel overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Orders</th>
                  <th className="px-3 py-3">Reviews</th>
                  <th className="px-3 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-3">
                      <Link href={`/admin/users/${account.id}`} className="font-semibold text-[#0f5eb8]">
                        {account.name ?? "Unnamed user"}
                      </Link>
                      <div className="text-xs text-slate-500">{account.email}</div>
                    </td>
                    <td className="px-3 py-3">{account.role}</td>
                    <td className="px-3 py-3">{account.orderCount}</td>
                    <td className="px-3 py-3">{account.reviewCount}</td>
                    <td className="px-3 py-3 text-slate-600">{new Date(account.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="panel">No users found.</div>
        )
      ) : null}
    </section>
  );
}
