"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteAdminProduct,
  getAdminProducts,
  type AdminProduct,
  type AdminProductSort,
  type AdminProductStatusFilter,
} from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatPrice";

const PAGE_SIZE = 20;

export function ProductTable() {
  const { token, isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminProductStatusFilter>("ALL");
  const [sort, setSort] = useState<AdminProductSort>("newest");
  const [page, setPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const loadProducts = async () => {
    if (!token || !isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getAdminProducts(token, {
        search: search.trim() || undefined,
        status,
        sort,
        page,
        limit: PAGE_SIZE,
      });
      setProducts(result.items);
      setTotal(result.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    void loadProducts();
  }, [token, isAuthenticated, user?.role, search, status, sort, page]);

  useEffect(() => {
    setSelectedProductIds((current) => current.filter((id) => products.some((product) => product.id === id && product.status !== "ARCHIVED")));
  }, [products]);

  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  const handleDelete = async (productId: string, name: string) => {
    if (!token || !confirm(`Are you sure you want to archive "${name}"? It will be moved to ARCHIVED status.`)) return;

    try {
      await deleteAdminProduct(token, productId);
      await loadProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product.");
    }
  };

  const selectableProductIds = products.filter((product) => product.status !== "ARCHIVED").map((product) => product.id);
  const isAllSelected = selectableProductIds.length > 0 && selectableProductIds.every((id) => selectedProductIds.includes(id));

  const toggleRowSelection = (productId: string) => {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProductIds((current) => {
      if (isAllSelected) {
        return current.filter((id) => !selectableProductIds.includes(id));
      }

      const merged = new Set([...current, ...selectableProductIds]);
      return Array.from(merged);
    });
  };

  const handleBulkArchive = async () => {
    if (!token || selectedProductIds.length === 0) return;

    const selectedProducts = products.filter((product) => selectedProductIds.includes(product.id));
    const namesPreview = selectedProducts.slice(0, 3).map((product) => `"${product.name}"`).join(", ");
    const namesSuffix = selectedProducts.length > 3 ? ` and ${selectedProducts.length - 3} more` : "";

    if (!confirm(`Archive ${selectedProducts.length} selected product(s): ${namesPreview}${namesSuffix}?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all(selectedProductIds.map((productId) => deleteAdminProduct(token, productId)));
      setSelectedProductIds([]);
      await loadProducts();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : "Failed to archive selected products.");
      setIsLoading(false);
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

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <input
          className="input md:col-span-2"
          placeholder="Search by name or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="input"
          aria-label="Filter products by status"
          value={status}
          onChange={(event) => setStatus(event.target.value as AdminProductStatusFilter)}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          className="input"
          aria-label="Sort products"
          value={sort}
          onChange={(event) => setSort(event.target.value as AdminProductSort)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
          <option value="stock-asc">Stock: Low to high</option>
          <option value="stock-desc">Stock: High to low</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-xs text-slate-500">
          {selectedProductIds.length} selected
        </p>
        <button
          className="button button--secondary"
          type="button"
          disabled={selectedProductIds.length === 0 || isLoading}
          onClick={() => void handleBulkArchive()}
        >
          Archive Selected
        </button>
      </div>

      <p className="mb-4 text-xs text-slate-500">
        Showing {products.length} of {total} products
      </p>

      {products.length === 0 ? (
        <p className="m-0 text-sm text-(--color-muted)">No products yet. Add your first product to publish it on the user side.</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all products on this page"
                  checked={isAllSelected}
                  disabled={selectableProductIds.length === 0}
                  onChange={toggleSelectAll}
                />
              </th>
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
                  <input
                    type="checkbox"
                    aria-label={`Select ${product.name}`}
                    checked={selectedProductIds.includes(product.id)}
                    disabled={product.status === "ARCHIVED"}
                    onChange={() => toggleRowSelection(product.id)}
                  />
                </td>
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

      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            className="button button--secondary"
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="button button--secondary"
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
