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

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  return requestApi<AdminOverview>("/admin", { token });
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
