import { requestApi } from "./client";
import type { DealType, Product } from "./products";

export type AdminOverview = {
  stats: {
    totalProducts: number;
    activeDeals: number;
    totalUsers: number;
    totalOrders: number;
    lowStockProducts: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    slug: string;
    stock: number;
    dealType: DealType | null;
    isDealActive: boolean;
  }>;
  recentOrders: Array<{
    id: string;
    status: "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    totalAmount: number;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }>;
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "CUSTOMER" | "ADMIN";
    createdAt: string;
  }>;
};

export type AdminCartRules = {
  minCartValue: number;
  maxQuantityPerProduct: number;
  freeShippingThreshold: number;
  taxRatePercent: number;
  abandonedHours: number;
  updatedAt: string;
};

export type AdminAbandonedCart = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  itemCount: number;
  subtotal: number;
  lastActivityAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    quantity: number;
    stock: number;
    unitPrice: number;
  }>;
};

export type AdminCartOverview = {
  metrics: {
    activeCarts: number;
    abandonedCarts: number;
    abandonedRate: number;
    averageCartValue: number;
    cartToCheckoutConversionRate: number;
    stockIssueItems: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    productSlug: string;
    totalQuantity: number;
  }>;
  abandonedPreview: AdminAbandonedCart[];
  rules: AdminCartRules;
};

export type AdminOrder = {
  id: string;
  status: "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    productId: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
};

export const adminOrderStatuses = ["PENDING", "PAID", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type AdminOrderStatus = (typeof adminOrderStatuses)[number];

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  reviewCount: number;
};

export type AdminUserDetail = AdminUser & {
  recentOrders: AdminOrder[];
};

export type AdminProduct = Product & {
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
  isFeatured: boolean;
  allowBackorder: boolean;
  lowStockThreshold: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  attributes: any;
};

export type AdminProductSort = "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "stock-asc" | "stock-desc";
export type AdminProductStatusFilter = "ALL" | "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";

export type AdminReview = {
  id: string;
  rating: number;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  product: { id: string; name: string; slug: string };
};

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  return requestApi<AdminOverview>("/admin", { token });
}

export async function getAdminProducts(
  token: string,
  params?: {
    search?: string;
    status?: AdminProductStatusFilter;
    sort?: AdminProductSort;
    page?: number;
    limit?: number;
  }
): Promise<{ items: AdminProduct[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "ALL") query.append("status", params.status);
  if (params?.sort) query.append("sort", params.sort);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const queryString = query.toString();
  return requestApi<{ items: AdminProduct[]; total: number }>(`/admin/products${queryString ? `?${queryString}` : ""}`, { token });
}

export async function getAdminProduct(token: string, productId: string): Promise<AdminProduct> {
  return requestApi<AdminProduct>(`/admin/products/${productId}`, { token });
}

export async function createAdminProduct(
  token: string,
  input: {
    name: string;
    slug: string;
    image?: File | null;
    imageUrl?: string | null;
    description?: string | null;
    price: number;
    stock: number;
    categoryId: string;
    status?: string;
    isFeatured?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    attributes?: any;
  }
): Promise<AdminProduct> {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("slug", input.slug);
  formData.append("price", String(input.price));
  formData.append("stock", String(input.stock));
  formData.append("categoryId", input.categoryId);

  if (input.description) formData.append("description", input.description);
  if (input.imageUrl) formData.append("imageUrl", input.imageUrl);
  if (input.image) formData.append("image", input.image);
  if (input.status) formData.append("status", input.status);
  if (input.isFeatured !== undefined) formData.append("isFeatured", String(input.isFeatured));
  if (input.allowBackorder !== undefined) formData.append("allowBackorder", String(input.allowBackorder));
  if (input.lowStockThreshold !== undefined) formData.append("lowStockThreshold", String(input.lowStockThreshold));
  if (input.seoTitle) formData.append("seoTitle", input.seoTitle);
  if (input.seoDescription) formData.append("seoDescription", input.seoDescription);
  if (input.seoKeywords) formData.append("seoKeywords", input.seoKeywords);
  if (input.attributes) formData.append("attributes", JSON.stringify(input.attributes));

  return requestApi<AdminProduct>("/admin/products", {
    method: "POST",
    token,
    body: formData,
  });
}

export async function updateAdminProduct(
  token: string,
  productId: string,
  input: {
    name?: string;
    slug?: string;
    image?: File | null;
    imageUrl?: string | null;
    description?: string | null;
    price?: number;
    stock?: number;
    categoryId?: string;
    status?: string;
    isFeatured?: boolean;
    allowBackorder?: boolean;
    lowStockThreshold?: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    attributes?: any;
  }
): Promise<AdminProduct> {
  const formData = new FormData();
  if (input.name) formData.append("name", input.name);
  if (input.slug) formData.append("slug", input.slug);
  if (input.price !== undefined) formData.append("price", String(input.price));
  if (input.stock !== undefined) formData.append("stock", String(input.stock));
  if (input.categoryId) formData.append("categoryId", input.categoryId);
  if (input.description !== undefined) formData.append("description", input.description || "");
  if (input.imageUrl !== undefined) formData.append("imageUrl", input.imageUrl || "");
  if (input.image) formData.append("image", input.image);
  if (input.status) formData.append("status", input.status);
  if (input.isFeatured !== undefined) formData.append("isFeatured", String(input.isFeatured));
  if (input.allowBackorder !== undefined) formData.append("allowBackorder", String(input.allowBackorder));
  if (input.lowStockThreshold !== undefined) formData.append("lowStockThreshold", String(input.lowStockThreshold));
  if (input.seoTitle !== undefined) formData.append("seoTitle", input.seoTitle || "");
  if (input.seoDescription !== undefined) formData.append("seoDescription", input.seoDescription || "");
  if (input.seoKeywords !== undefined) formData.append("seoKeywords", input.seoKeywords || "");
  if (input.attributes !== undefined) formData.append("attributes", JSON.stringify(input.attributes));

  return requestApi<AdminProduct>(`/admin/products/${productId}`, {
    method: "PATCH",
    token,
    body: formData,
  });
}

export async function deleteAdminProduct(token: string, productId: string): Promise<void> {
  return requestApi<void>(`/admin/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminReviews(token: string): Promise<{ items: AdminReview[]; total: number }> {
  return requestApi<{ items: AdminReview[]; total: number }>("/admin/reviews", { token });
}

export async function updateAdminReviewStatus(
  token: string,
  reviewId: string,
  status: "PENDING" | "APPROVED" | "REJECTED"
): Promise<AdminReview> {
  return requestApi<AdminReview>(`/admin/reviews/${reviewId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export async function deleteAdminReview(token: string, reviewId: string): Promise<void> {
  return requestApi<void>(`/admin/reviews/${reviewId}`, {
    method: "DELETE",
    token,
  });
}

export async function getAdminOrders(token: string): Promise<{ items: AdminOrder[]; total: number }> {
  return requestApi<{ items: AdminOrder[]; total: number }>("/admin/orders", { token });
}

export async function getAdminOrder(token: string, orderId: string): Promise<AdminOrder> {
  return requestApi<AdminOrder>(`/admin/orders/${orderId}`, { token });
}

export async function updateAdminOrderStatus(
  token: string,
  orderId: string,
  status: AdminOrderStatus
): Promise<AdminOrder> {
  return requestApi<AdminOrder>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
}

export async function getAdminUsers(token: string): Promise<{ items: AdminUser[]; total: number }> {
  return requestApi<{ items: AdminUser[]; total: number }>("/admin/users", { token });
}

export async function getAdminUser(token: string, userId: string): Promise<AdminUserDetail> {
  return requestApi<AdminUserDetail>(`/admin/users/${userId}`, { token });
}

export async function getAdminDeals(token: string): Promise<{ items: Product[]; total: number }> {
  return requestApi<{ items: Product[]; total: number }>("/admin/deals", { token });
}

export async function updateAdminDeal(
  token: string,
  productId: string,
  input: {
    dealType?: DealType | null;
    isDealActive?: boolean;
    dealStartAt?: string | null;
    dealEndAt?: string | null;
  }
): Promise<Product> {
  return requestApi<Product>(`/admin/deals/${productId}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export async function getAdminCartOverview(token: string): Promise<AdminCartOverview> {
  return requestApi<AdminCartOverview>("/admin/cart/overview", { token });
}

export async function getAdminAbandonedCarts(
  token: string,
  params?: { hours?: number; page?: number; limit?: number }
): Promise<{ page: number; limit: number; total: number; cutoff: string; items: AdminAbandonedCart[] }> {
  const query = new URLSearchParams();
  if (params?.hours) query.append("hours", String(params.hours));
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const queryString = query.toString();
  return requestApi<{ page: number; limit: number; total: number; cutoff: string; items: AdminAbandonedCart[] }>(
    `/admin/cart/abandoned${queryString ? `?${queryString}` : ""}`,
    { token }
  );
}

export async function getAdminCartRules(token: string): Promise<AdminCartRules> {
  return requestApi<AdminCartRules>("/admin/cart/rules", { token });
}

export async function updateAdminCartRules(
  token: string,
  input: {
    minCartValue: number;
    maxQuantityPerProduct: number;
    freeShippingThreshold: number;
    taxRatePercent: number;
    abandonedHours: number;
  }
): Promise<AdminCartRules> {
  return requestApi<AdminCartRules>("/admin/cart/rules", {
    method: "PUT",
    token,
    body: input,
  });
}
