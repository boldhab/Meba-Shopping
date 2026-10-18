"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  type AdminCategory,
} from "@/lib/api/admin";
import { useAuth } from "@/lib/hooks/useAuth";

export function CategoryManager() {
  const { token, isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Edit modal state
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCategories = async () => {
    if (!token || !isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items = await getAdminCategories(token);
      setCategories(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, [token, isAuthenticated, user?.role]);

  const handleNameChange = (val: string) => {
    setNewName(val);
    const slugified = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setNewSlug(slugified);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;

    setIsCreating(true);
    try {
      await createAdminCategory(token, {
        name: newName.trim(),
        slug: newSlug.trim() || undefined,
      });
      setNewName("");
      setNewSlug("");
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (category: AdminCategory) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditSlug(category.slug);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !editingCategory || !editName.trim()) return;

    setIsUpdating(true);
    try {
      await updateAdminCategory(token, editingCategory.id, {
        name: editName.trim(),
        slug: editSlug.trim() || undefined,
      });
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (!token) return;
    const confirmMsg =
      category.productCount > 0
        ? `Warning: Category "${category.name}" has ${category.productCount} associated product(s). Deleting it will leave those products uncategorized. Continue?`
        : `Are you sure you want to delete category "${category.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      await deleteAdminCategory(token, category.id);
      await loadCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category.");
    }
  };

  if (isLoading) return <div className="panel">Loading categories...</div>;
  if (error) return <div className="panel text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Create Category Panel */}
      <div className="panel">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Create New Category</h2>
        <p className="text-xs text-slate-500 mb-4">
          Add a category to organize store products. Slugs are automatically formatted.
        </p>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Produce"
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">URL Slug</label>
            <input
              type="text"
              placeholder="fresh-produce"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isCreating || !newName.trim()}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? "Creating..." : "+ Add Category"}
            </button>
          </div>
        </form>
      </div>

      {/* Categories List Panel */}
      <div className="panel overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800 m-0">All Categories</h2>
            <p className="text-xs text-slate-500 m-0">Total: {categories.length} categories</p>
          </div>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-slate-500">No categories found. Create one above.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Slug</th>
                <th className="px-3 py-3">Products</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-3 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-500">/{cat.slug}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cat.productCount} products
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-transparent border-none p-0 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-transparent border-none p-0 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Edit Category</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editName.trim() || !editSlug.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
