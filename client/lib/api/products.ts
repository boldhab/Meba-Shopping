import { apiClient } from "./client";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
  category?: Category;
}

export async function getProducts(params?: { categoryId?: string; search?: string }): Promise<{ items: Product[]; total: number }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.append("categoryId", params.categoryId);
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const url = `${apiClient.baseUrl}/products${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    return { items: [], total: 0 };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${apiClient.baseUrl}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch product");
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${apiClient.baseUrl}/categories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
