"use client";

import { AuthProvider } from "@/contexts/AuthContext";

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}
