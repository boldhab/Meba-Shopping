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
};

export type WishlistItem = {
  id: string;
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

export async function fetchAccountOrders(token: string) {
  return requestApi<{ items: AccountOrder[] }>("/account/orders", { token });
}

export async function fetchAccountOrder(token: string, orderId: string) {
  return requestApi<AccountOrder>(`/account/orders/${orderId}`, { token });
}

export async function cancelAccountOrder(token: string, orderId: string) {
  const order = await requestApi<AccountOrder>(`/account/orders/${orderId}/cancel`, {
    method: "POST",
    token,
  });
  notifyAccountStoreUpdated();
  return order;
}

export async function returnAccountOrder(token: string, orderId: string) {
  const order = await requestApi<AccountOrder>(`/account/orders/${orderId}/return`, {
    method: "POST",
    token,
  });
  notifyAccountStoreUpdated();
  return order;
}

export async function fetchWishlistItems(token: string) {
  return requestApi<{ items: WishlistItem[] }>("/account/wishlist", { token });
}

export async function addWishlistItem(token: string, item: WishlistItem) {
  const result = await requestApi<{ items: WishlistItem[] }>("/account/wishlist", {
    method: "POST",
    token,
    body: item,
  });
  notifyAccountStoreUpdated();
  return result.items;
}

export async function updateWishlistItem(token: string, itemId: string, updates: Partial<WishlistItem>) {
  const result = await requestApi<{ items: WishlistItem[] }>(`/account/wishlist/${itemId}`, {
    method: "PATCH",
    token,
    body: updates,
  });
  notifyAccountStoreUpdated();
  return result.items;
}

export async function removeWishlistItem(token: string, itemId: string) {
  const result = await requestApi<{ items: WishlistItem[] }>(`/account/wishlist/${itemId}`, {
    method: "DELETE",
    token,
  });
  notifyAccountStoreUpdated();
  return result.items;
}

export function moveWishlistItemToCart(item: WishlistItem) {
  return {
    productId: item.id,
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
