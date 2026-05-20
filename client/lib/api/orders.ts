import { requestApi } from "./client";

export type ShippingDetails = {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
};

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  productId: string;
  product?: {
    name: string;
    imageUrl: string | null;
    slug: string;
  };
};

export type Order = {
  id: string;
  status: "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  shippingName: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
};

export async function createOrder(shippingDetails: ShippingDetails, token: string): Promise<Order> {
  return requestApi<Order>("/orders", {
    method: "POST",
    body: shippingDetails,
    token,
  });
}

export async function getOrders(token: string): Promise<Order[]> {
  return requestApi<Order[]>("/orders", {
    method: "GET",
    token,
  });
}

export async function getOrderById(orderId: string, token: string): Promise<Order> {
  return requestApi<Order>(`/orders/${orderId}`, {
    method: "GET",
    token,
  });
}
