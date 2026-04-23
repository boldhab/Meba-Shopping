"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminProduct, getAdminProduct, updateAdminProduct } from "@/lib/api/admin";
import { getCategories, type Category } from "@/lib/api/products";
import { useAuth } from "@/lib/hooks/useAuth";
import { ImageUpload } from "./ImageUpload";

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
  const [status, setStatus] = useState("DRAFT");
  const [isFeatured, setIsFeatured] = useState(false);
  const [allowBackorder, setAllowBackorder] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [attributes, setAttributes] = useState("{}");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

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
          setStatus(product.status);
          setIsFeatured(product.isFeatured);
          setAllowBackorder(product.allowBackorder);
          setLowStockThreshold(String(product.lowStockThreshold));
          setSeoTitle(product.seoTitle ?? "");
          setSeoDescription(product.seoDescription ?? "");
          setSeoKeywords(product.seoKeywords ?? "");
          setAttributes(JSON.stringify(product.attributes ?? {}, null, 2));
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

    let parsedAttributes = {};
    try {
      parsedAttributes = JSON.parse(attributes);
    } catch (e) {
      setError("Attributes must be valid JSON.");
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
        status,
        isFeatured,
        allowBackorder,
        lowStockThreshold: Number(lowStockThreshold),
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        seoKeywords: seoKeywords.trim() || null,
        attributes: parsedAttributes,
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
        <p className="m-0 text-sm text-(--color-muted)">Manage product details, SEO, and inventory settings.</p>
      </div>

      <div className="flex border-b border-(--color-border) mb-4">
        {["basic", "inventory", "seo", "attributes"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-4 py-2 capitalize ${activeTab === tab ? "border-b-2 border-primary font-bold" : "text-(--color-muted)"}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "basic" && (
        <div className="form-stack">
          <label className="label-stack">
            <span>Name</span>
            <input className="input" value={name} onChange={(event) => handleNameChange(event.target.value)} required />
          </label>

          <label className="label-stack">
            <span>Slug</span>
            <input className="input" value={slug} onChange={(event) => setSlug(event.target.value)} required />
          </label>

          <ImageUpload
            label="Product Image"
            file={imageFile}
            existingImageUrl={existingImageUrl}
            required={!productId}
            productName={name}
            onChange={setImageFile}
          />

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
          </div>

          <label className="label-stack">
            <span>Status</span>
            <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="form-stack">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="label-stack">
              <span>Current Stock</span>
              <input className="input" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
            </label>

            <label className="label-stack">
              <span>Low Stock Threshold</span>
              <input className="input" type="number" min="0" step="1" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(event.target.value)} />
            </label>
          </div>

          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              <span>Featured Item</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={allowBackorder} onChange={(e) => setAllowBackorder(e.target.checked)} />
              <span>Allow Backorders</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="form-stack">
          <label className="label-stack">
            <span>SEO Title</span>
            <input className="input" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Browser tab title" />
          </label>
          <label className="label-stack">
            <span>SEO Description</span>
            <textarea className="input" rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} placeholder="Meta description for search engines" />
          </label>
          <label className="label-stack">
            <span>SEO Keywords</span>
            <input className="input" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
          </label>
        </div>
      )}

      {activeTab === "attributes" && (
        <div className="form-stack">
          <label className="label-stack">
            <span>Attributes (JSON)</span>
            <textarea
              className="input font-mono text-sm"
              rows={10}
              value={attributes}
              onChange={(e) => setAttributes(e.target.value)}
              placeholder='{ "Brand": "Example", "Type": "Organic" }'
            />
            <p className="text-xs text-(--color-muted)">Provide specifications and attributes in JSON format.</p>
          </label>
        </div>
      )}

      {error ? <p className="form-error">{error}</p> : null}

      <div className="flex flex-wrap gap-3 mt-4">
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
