"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export function AdminGuard({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      const next = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, router, searchParams, user?.role]);

  if (isLoading) {
    return <div className="panel">Checking admin access...</div>;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <div className="panel">Redirecting...</div>;
  }

  return <>{children}</>;
}
