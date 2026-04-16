"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="pagination" style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center", marginTop: "2rem" }}>
      {currentPage > 1 ? (
        <Link href={createPageUrl(currentPage - 1)} className="button button--secondary">
          &larr; Previous
        </Link>
      ) : (
        <button disabled className="button button--secondary">&larr; Previous</button>
      )}
      
      <span className="pagination__info" style={{ fontWeight: "bold" }}>
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link href={createPageUrl(currentPage + 1)} className="button button--secondary">
          Next &rarr;
        </Link>
      ) : (
        <button disabled className="button button--secondary">Next &rarr;</button>
      )}
    </div>
  );
}
