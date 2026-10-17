export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export interface ShippingDetails {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
}

export interface OrderItemDTO {
  id: string;
  quantity: number;
  unitPrice: number;
  productId: string;
  product?: {
    name: string;
    imageUrl: string | null;
    slug: string;
  };
}

export interface OrderDTO {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingName?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingZip?: string | null;
  shippingCountry?: string | null;
  items: OrderItemDTO[];
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}
