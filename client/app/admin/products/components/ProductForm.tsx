"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminProduct, getAdminProduct, updateAdminProduct } from "@/lib/api/admin";
import { getCategories, type Category } from "@/lib/api/products";
import { useAuth } from "@/lib/hooks/useAuth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { token, isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      setIsLoading(true);
      setError(null);

      try {
        const [categoryItems, product] = await Promise.all([
          getCategories(),
          token && productId ? getAdminProduct(token, productId) : Promise.resolve(null),
        ]);

        setCategories(categoryItems);

        if (product) {
          setName(product.name);
          setSlug(product.slug);
          setExistingImageUrl(product.imageUrl ?? "");
          setDescription(product.description ?? "");
          setPrice(String(product.price));
          setStock(String(product.stock));
          setCategoryId(product.categoryId);
        } else if (categoryItems[0]) {
          setCategoryId((current) => current || categoryItems[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load product form.");
      } finally {
        setIsLoading(false);
      }
    }

    if (!token || !isAuthenticated || user?.role !== "ADMIN") {
      setIsLoading(false);
      return;
    }

    void loadForm();
  }, [token, isAuthenticated, user?.role, productId]);

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug((current) => (productId || current ? current : slugify(value)));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    if (!productId && !imageFile) {
      setError("Product image is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        slug: slugify(slug),
        image: imageFile,
        imageUrl: existingImageUrl || null,
        description: description.trim() || null,
        price: Number(price),
        stock: Number(stock),
        categoryId,
      };

      if (productId) {
        await updateAdminProduct(token, productId, payload);
      } else {
        await createAdminProduct(token, payload);
      }

      router.push("/admin/products");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="panel">Loading product form...</div>;
  }

  return (
    <form className="panel form-stack" onSubmit={handleSubmit}>
      <div>
        <h2 className="m-0">{productId ? "Edit product" : "Create product"}</h2>
        <p className="m-0 text-sm text-(--color-muted)">Products saved here are visible on the storefront product pages.</p>
      </div>

      <label className="label-stack">
        <span>Name</span>
        <input className="input" value={name} onChange={(event) => handleNameChange(event.target.value)} required />
      </label>

      <label className="label-stack">
        <span>Slug</span>
        <input className="input" value={slug} onChange={(event) => setSlug(event.target.value)} required />
      </label>

      <label className="label-stack">
        <span>Product Image</span>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setImageFile(file);
          }}
          required={!productId}
        />
      </label>

      {existingImageUrl ? (
        <div className="label-stack">
          <span>Current Image</span>
          <img src={existingImageUrl} alt={`${name || "Product"} preview`} className="max-h-40 w-auto rounded-lg border border-(--color-border)" />
        </div>
      ) : null}

      <label className="label-stack">
        <span>Description</span>
        <textarea
          className="input"
          rows={6}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="label-stack">
          <span>Price</span>
          <input className="input" type="number" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </label>

        <label className="label-stack">
          <span>Stock</span>
          <input className="input" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
        </label>
      </div>

      <label className="label-stack">
        <span>Category</span>
        <select className="input" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
          <option value="" disabled>Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="button" disabled={isSaving}>
          {isSaving ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </button>
        <button type="button" className="button bg-transparent text-(--color-text)" onClick={() => router.push("/admin/products")}>
          Cancel
        </button>
      </div>
    </form>
  );
}
