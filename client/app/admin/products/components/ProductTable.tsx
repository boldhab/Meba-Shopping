"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteAdminProduct, getAdminProducts, type AdminProduct } from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

export function ProductTable() {
  const { token, isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
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
  };

  useEffect(() => {
    void loadProducts();
  }, [token, isAuthenticated, user?.role]);

  const handleDelete = async (productId: string, name: string) => {
    if (!token || !confirm(`Are you sure you want to archive "${name}"? It will be moved to ARCHIVED status.`)) return;

    try {
      await deleteAdminProduct(token, productId);
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "INACTIVE": return "bg-yellow-100 text-yellow-800";
      case "ARCHIVED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
          <p className="m-0 text-sm text-(--color-muted)">Manage your inventory, pricing, and visibility from here.</p>
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
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-slate-100 align-top hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-slate-800">{product.name}</div>
                    {product.isFeatured && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded-full font-bold">FEAT</span>}
                  </div>
                  <div className="text-xs text-slate-500">/{product.slug}</div>
                </td>
                <td className="px-3 py-3">{product.category?.name ?? "Uncategorized"}</td>
                <td className="px-3 py-3 font-semibold">{formatPrice(Number(product.price))}</td>
                <td className="px-3 py-3">
                  <span className={product.stock <= product.lowStockThreshold ? "text-red-600 font-bold" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/admin/products/${product.id}/edit`} className="admin-dashboard__inline-link">
                      Edit
                    </Link>
                    <Link href={`/products/${product.slug}`} className="admin-dashboard__inline-link text-blue-600">
                      View
                    </Link>
                    {product.status !== "ARCHIVED" && (
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="admin-dashboard__inline-link text-red-600 border-none bg-transparent p-0 cursor-pointer"
                      >
                        Archive
                      </button>
                    )}
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
