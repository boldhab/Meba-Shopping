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

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  return requestApi<AdminOverview>("/admin", { token });
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
