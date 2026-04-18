import { requestApi } from "./client";
import type { DealType, Product } from "./products";

export async function getAdminOverview(token: string) {
  return requestApi<{ resource: string }>("/admin", { token });
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
