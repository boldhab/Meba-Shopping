"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return <footer className="admin-footer">Meba admin workspace</footer>;
  }

  return <footer className="site-footer">Meba Shopping scaffold</footer>;
}
