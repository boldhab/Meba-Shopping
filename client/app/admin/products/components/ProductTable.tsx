"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminProducts, type AdminProduct } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

export function ProductTable() {
  const { token, isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      if (!token || !isAuthenticated || user?.role !== "ADMIN") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await getAdminProducts(token);
        setProducts(result.items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, [token, isAuthenticated, user?.role]);

  if (isLoading) {
    return <div className="panel">Loading products...</div>;
  }

  if (error) {
    return <div className="panel text-[#b42318]">{error}</div>;
  }

  return (
    <div className="panel overflow-x-auto">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="m-0">Catalog products</h2>
          <p className="m-0 text-sm text-(--color-muted)">Products added here appear automatically on the storefront.</p>
        </div>
        <Link href="/admin/products/create" className="button">
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="m-0 text-sm text-(--color-muted)">No products yet. Add your first product to publish it on the user side.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Price</th>
              <th className="px-3 py-3">Stock</th>
              <th className="px-3 py-3">Deal</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-3">
                  <div className="font-medium text-slate-800">{product.name}</div>
                  <div className="text-xs text-slate-500">/{product.slug}</div>
                </td>
                <td className="px-3 py-3">{product.category?.name ?? "Uncategorized"}</td>
                <td className="px-3 py-3 font-semibold">{formatPrice(Number(product.price))}</td>
                <td className="px-3 py-3">{product.stock}</td>
                <td className="px-3 py-3">{product.isDealActive && product.dealType ? product.dealType : "None"}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="admin-dashboard__inline-link">
                      Edit
                    </Link>
                    <Link href={`/products/${product.slug}`} className="admin-dashboard__inline-link">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
