import { requestApi } from "./client";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Canceled" | "Returned";
export type PaymentStatus = "Paid" | "Unpaid" | "Refunded" | "Failed";
export type MessageCategory = "Sales" | "Support" | "Promotions";
export type AccountView = "price" | "date" | "popularity";

export type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  thumbnail: string;
};

export type AccountOrder = {
  id: string;
  orderDateTime: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  tax: number;
  shipping: number;
  trackingUrl?: string;
  canCancel: boolean;
  canReturn: boolean;
  items: OrderItem[];
  shippingName?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingZip?: string;
  shippingCountry?: string;
};

export type WishlistItem = {
  id: string;
  productId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  stockStatus: "In stock" | "Out of stock" | "Low stock";
  popularity: number;
  dateAdded: string;
  quantity?: number;
};

export type InboxMessage = {
  id: string;
  sender: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  category: MessageCategory;
  replies?: Array<{ body: string; timestamp: string }>;
};

export type AccountProfile = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
};

export type AccountAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  isDefault: boolean;
};

export type AccountPreferences = {
  emailOrderUpdates: boolean;
  emailWishlistAlerts: boolean;
  emailPromotions: boolean;
  smsAlerts: boolean;
  pushNotifications: boolean;
  newsletter: boolean;
  currency: string;
  language: string;
};

export type AccountSettings = {
  profile: AccountProfile;
  addresses: AccountAddress[];
  preferences: AccountPreferences;
};

const ACCOUNT_STORE_UPDATED_EVENT = "meba:account-store-updated";

export function notifyAccountStoreUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ACCOUNT_STORE_UPDATED_EVENT));
}

export function listenForAccountStoreUpdates(handler: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(ACCOUNT_STORE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(ACCOUNT_STORE_UPDATED_EVENT, handler);
}

function normalizeAccountOrder(raw: any): AccountOrder {
  if (!raw) return raw;
  const amountPaid = typeof raw.totalAmount === "number" ? raw.totalAmount : Number(raw.totalAmount ?? raw.amountPaid ?? 0);
  const orderDateTime = raw.createdAt || raw.orderDateTime || new Date().toISOString();

  let orderStatus: OrderStatus = "Pending";
  if (raw.status) {
    const s = String(raw.status).toLowerCase();
    if (s === "pending") orderStatus = "Pending";
    else if (s === "paid" || s === "packed") orderStatus = "Processing";
    else if (s === "shipped") orderStatus = "Shipped";
    else if (s === "delivered") orderStatus = "Delivered";
    else if (s === "cancelled") orderStatus = "Canceled";
    else if (s === "returned") orderStatus = "Returned";
  } else if (raw.orderStatus) {
    orderStatus = raw.orderStatus;
  }

  let paymentStatus: PaymentStatus = "Unpaid";
  if (raw.paymentStatus) {
    const p = String(raw.paymentStatus).toLowerCase();
    if (p === "paid") paymentStatus = "Paid";
    else if (p === "unpaid") paymentStatus = "Unpaid";
    else if (p === "refunded") paymentStatus = "Refunded";
    else if (p === "failed") paymentStatus = "Failed";
  }

  const items = Array.isArray(raw.items)
    ? raw.items.map((item: any) => ({
        id: item.id,
        productName: item.product?.name || item.productName || "Product",
        quantity: item.quantity ?? 1,
        unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : Number(item.unitPrice ?? 0),
        thumbnail: item.product?.imageUrl || item.thumbnail || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
      }))
    : [];

  return {
    id: raw.id,
    orderDateTime,
    orderStatus,
    paymentStatus,
    amountPaid,
    tax: raw.tax ?? 0,
    shipping: raw.shipping ?? (amountPaid >= 1000 ? 0 : 100),
    trackingUrl: raw.trackingUrl,
    canCancel: orderStatus === "Pending" || orderStatus === "Processing",
    canReturn: orderStatus === "Delivered",
    items,
    shippingName: raw.shippingName ?? undefined,
    shippingAddress: raw.shippingAddress ?? undefined,
    shippingCity: raw.shippingCity ?? undefined,
    shippingZip: raw.shippingZip ?? undefined,
    shippingCountry: raw.shippingCountry ?? undefined,
  };
}

export async function fetchAccountOrders(token: string) {
  const result = await requestApi<{ items: any[] }>("/account/orders", { token });
  return { items: (result.items || []).map(normalizeAccountOrder) };
}

export async function fetchAccountOrder(token: string, orderId: string) {
  const result = await requestApi<any>(`/account/orders/${orderId}`, { token });
  return normalizeAccountOrder(result);
}

export async function cancelAccountOrder(token: string, orderId: string) {
  const order = await requestApi<any>(`/account/orders/${orderId}/cancel`, {
    method: "POST",
    token,
  });
  notifyAccountStoreUpdated();
  return normalizeAccountOrder(order);
}

export async function returnAccountOrder(token: string, orderId: string) {
  const order = await requestApi<any>(`/account/orders/${orderId}/return`, {
    method: "POST",
    token,
  });
  notifyAccountStoreUpdated();
  return normalizeAccountOrder(order);
}

function normalizeWishlistItem(raw: any): WishlistItem {
  const product = raw.product || {};
  const price = typeof product.price === "number" ? product.price : Number(product.price ?? raw.price ?? 0);
  const stock = typeof product.stock === "number" ? product.stock : (raw.stock ?? 10);
  let stockStatus: "In stock" | "Out of stock" | "Low stock" = "In stock";
  if (stock <= 0) stockStatus = "Out of stock";
  else if (stock < 5) stockStatus = "Low stock";

  return {
    id: raw.id,
    productId: raw.productId || product.id || raw.id,
    name: product.name || raw.name || "Product",
    slug: product.slug || raw.slug || "",
    image: product.imageUrl || raw.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
    price,
    salePrice: raw.salePrice,
    stockStatus,
    popularity: raw.popularity ?? 0,
    dateAdded: raw.createdAt || raw.dateAdded || new Date().toISOString(),
    quantity: raw.quantity ?? 1,
  };
}

export async function fetchWishlistItems(token: string) {
  const result = await requestApi<{ items: any[] }>("/account/wishlist", { token });
  return { items: (result.items || []).map(normalizeWishlistItem) };
}

export async function addWishlistItem(token: string, item: WishlistItem) {
  const result = await requestApi<{ items: any[] }>("/account/wishlist", {
    method: "POST",
    token,
    body: {
      productId: item.productId || item.id,
      quantity: item.quantity ?? 1,
    },
  });
  notifyAccountStoreUpdated();
  return (result.items || []).map(normalizeWishlistItem);
}

export async function updateWishlistItem(token: string, itemId: string, updates: Partial<WishlistItem>) {
  const result = await requestApi<{ items: any[] }>(`/account/wishlist/${itemId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
  notifyAccountStoreUpdated();
  return (result.items || []).map(normalizeWishlistItem);
}

export async function removeWishlistItem(token: string, itemId: string) {
  const result = await requestApi<{ items: any[] }>(`/account/wishlist/${itemId}`, {
    method: "DELETE",
    token,
  });
  notifyAccountStoreUpdated();
  return (result.items || []).map(normalizeWishlistItem);
}

export function moveWishlistItemToCart(item: WishlistItem) {
  return {
    productId: item.productId || item.id,
    slug: item.slug,
    name: item.name,
    price: item.salePrice ?? item.price,
    quantity: item.quantity ?? 1,
    stock: item.stockStatus === "Out of stock" ? 0 : 10,
    imageUrl: item.image,
  };
}

export async function fetchInboxMessages(token: string) {
  return requestApi<{ items: InboxMessage[]; unreadCount: number }>("/account/messages", { token });
}

export async function replyToMessage(token: string, messageId: string, body: string) {
  const message = await requestApi<InboxMessage>(`/account/messages/${messageId}/reply`, {
    method: "POST",
    token,
    body: { body },
  });
  notifyAccountStoreUpdated();
  return message;
}

export async function markMessageRead(token: string, messageId: string, read = true) {
  const message = await requestApi<InboxMessage>(`/account/messages/${messageId}/read`, {
    method: "PATCH",
    token,
    body: { read },
  });
  notifyAccountStoreUpdated();
  return message;
}

export async function archiveMessage(token: string, messageId: string) {
  const message = await requestApi<InboxMessage>(`/account/messages/${messageId}/archive`, {
    method: "PATCH",
    token,
  });
  notifyAccountStoreUpdated();
  return message;
}

export async function deleteMessage(token: string, messageId: string) {
  const result = await requestApi<{ items: InboxMessage[] }>(`/account/messages/${messageId}`, {
    method: "DELETE",
    token,
  });
  notifyAccountStoreUpdated();
  return result.items;
}

export async function fetchAccountSettings(token: string) {
  return requestApi<AccountSettings>("/account/settings", { token });
}

export async function saveAccountSettings(token: string, settings: AccountSettings) {
  const next = await requestApi<AccountSettings>("/account/settings", {
    method: "PUT",
    token,
    body: settings,
  });
  notifyAccountStoreUpdated();
  return next;
}

export async function fetchUnreadMessageCount(token: string) {
  const result = await fetchInboxMessages(token);
  return result.unreadCount;
}
