import type { CartItem } from "./cart";

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

type AccountStore = {
  orders: AccountOrder[];
  wishlist: WishlistItem[];
  messages: InboxMessage[];
  settings: AccountSettings;
};

const STORAGE_KEY = "meba.account.store";
export const ACCOUNT_STORE_UPDATED_EVENT = "meba:account-store-updated";

const defaultStore: AccountStore = {
  orders: [
    {
      id: "ME-10024",
      orderDateTime: "2026-04-27T16:40:00",
      orderStatus: "Shipped",
      paymentStatus: "Paid",
      amountPaid: 3499,
      tax: 315,
      shipping: 120,
      trackingUrl: "https://carrier.example/track/ME-10024",
      canCancel: false,
      canReturn: true,
      items: [
        { id: "p1", productName: "Premium Coffee Beans", quantity: 2, unitPrice: 620, thumbnail: "https://placehold.co/56x56?text=C" },
        { id: "p2", productName: "Organic Honey", quantity: 1, unitPrice: 450, thumbnail: "https://placehold.co/56x56?text=H" },
      ],
    },
    {
      id: "ME-10017",
      orderDateTime: "2026-04-22T11:20:00",
      orderStatus: "Processing",
      paymentStatus: "Paid",
      amountPaid: 1890,
      tax: 170,
      shipping: 90,
      trackingUrl: "https://carrier.example/track/ME-10017",
      canCancel: true,
      canReturn: false,
      items: [
        { id: "p3", productName: "Brown Rice 5kg", quantity: 1, unitPrice: 890, thumbnail: "https://placehold.co/56x56?text=R" },
        { id: "p4", productName: "Olive Oil 1L", quantity: 1, unitPrice: 640, thumbnail: "https://placehold.co/56x56?text=O" },
      ],
    },
    {
      id: "ME-10004",
      orderDateTime: "2026-03-15T09:05:00",
      orderStatus: "Returned",
      paymentStatus: "Refunded",
      amountPaid: 1220,
      tax: 110,
      shipping: 70,
      canCancel: false,
      canReturn: false,
      items: [{ id: "p5", productName: "Almond Milk", quantity: 3, unitPrice: 210, thumbnail: "https://placehold.co/56x56?text=M" }],
    },
  ],
  wishlist: [
    {
      id: "w1",
      name: "Organic Avocado Oil",
      slug: "organic-avocado-oil",
      image: "https://placehold.co/80x80?text=A",
      price: 980,
      salePrice: 850,
      stockStatus: "In stock",
      popularity: 93,
      dateAdded: "2026-04-23",
      quantity: 1,
    },
    {
      id: "w2",
      name: "Quinoa Mix 1kg",
      slug: "quinoa-mix-1kg",
      image: "https://placehold.co/80x80?text=Q",
      price: 560,
      stockStatus: "Low stock",
      popularity: 81,
      dateAdded: "2026-04-15",
      quantity: 1,
    },
    {
      id: "w3",
      name: "Almond Butter",
      slug: "almond-butter",
      image: "https://placehold.co/80x80?text=B",
      price: 720,
      stockStatus: "Out of stock",
      popularity: 70,
      dateAdded: "2026-03-30",
      quantity: 1,
    },
  ],
  messages: [
    {
      id: "m1",
      sender: "Meba Support",
      subject: "Order ME-10024 has shipped",
      body: "Your order has been handed over to the carrier. Use the tracking link from My Orders for live updates.",
      timestamp: new Date().toISOString(),
      read: false,
      archived: false,
      category: "Support",
      replies: [],
    },
    {
      id: "m2",
      sender: "Meba Promotions",
      subject: "Weekend sale starts now",
      body: "Enjoy up to 25% discount on selected categories. Add products to your cart before midnight.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      archived: false,
      category: "Promotions",
      replies: [],
    },
    {
      id: "m3",
      sender: "Account Team",
      subject: "Your refund has been processed",
      body: "The refund for order ME-10004 is now completed. It may take 3-5 business days to reflect in your account.",
      timestamp: "2026-04-20T10:00:00",
      read: true,
      archived: false,
      category: "Sales",
      replies: [],
    },
  ],
  settings: {
    profile: {
      fullName: "Habtamu User",
      email: "hab@example.com",
      phone: "+251900000000",
      dob: "1995-05-12",
      gender: "Male",
    },
    addresses: [
      { id: "a1", label: "Home", line1: "Bole Road, House 12", city: "Addis Ababa", isDefault: true },
      { id: "a2", label: "Office", line1: "Kazanchis, Block C", city: "Addis Ababa", isDefault: false },
    ],
    preferences: {
      emailOrderUpdates: true,
      emailWishlistAlerts: true,
      emailPromotions: false,
      smsAlerts: false,
      pushNotifications: true,
      newsletter: true,
      currency: "ETB",
      language: "English",
    },
  },
};

function readStore(): AccountStore {
  if (typeof window === "undefined") return structuredClone(defaultStore);

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultStore);

    const parsed = JSON.parse(raw) as Partial<AccountStore> | null;
    if (!parsed) return structuredClone(defaultStore);

    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : structuredClone(defaultStore.orders),
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : structuredClone(defaultStore.wishlist),
      messages: Array.isArray(parsed.messages) ? parsed.messages : structuredClone(defaultStore.messages),
      settings: parsed.settings ?? structuredClone(defaultStore.settings),
    };
  } catch {
    return structuredClone(defaultStore);
  }
}

function writeStore(store: AccountStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(ACCOUNT_STORE_UPDATED_EVENT));
}

export function getAccountStore() {
  return readStore();
}

export function saveAccountStore(nextStore: AccountStore) {
  writeStore(nextStore);
  return nextStore;
}

export function getAccountOrders() {
  return readStore().orders;
}

export function getAccountOrder(orderId: string) {
  return readStore().orders.find((order) => order.id === orderId) ?? null;
}

export function updateAccountOrder(orderId: string, updater: (order: AccountOrder) => AccountOrder) {
  const store = readStore();
  const nextStore = {
    ...store,
    orders: store.orders.map((order) => (order.id === orderId ? updater(order) : order)),
  };
  writeStore(nextStore);
  return nextStore.orders.find((order) => order.id === orderId) ?? null;
}

export function getWishlistItems() {
  return readStore().wishlist;
}

export function updateWishlistItems(updater: (items: WishlistItem[]) => WishlistItem[]) {
  const store = readStore();
  const nextStore = { ...store, wishlist: updater(store.wishlist) };
  writeStore(nextStore);
  return nextStore.wishlist;
}

export function removeWishlistItem(itemId: string) {
  return updateWishlistItems((items) => items.filter((item) => item.id !== itemId));
}

export function moveWishlistItemToCart(item: WishlistItem): CartItem {
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

export function getInboxMessages() {
  return readStore().messages;
}

export function saveInboxMessages(messages: InboxMessage[]) {
  const store = readStore();
  const nextStore = { ...store, messages };
  writeStore(nextStore);
  return messages;
}

export function getUnreadMessageCount() {
  return getInboxMessages().filter((message) => !message.read && !message.archived).length;
}

export function getAccountSettings() {
  return readStore().settings;
}

export function saveAccountSettings(settings: AccountSettings) {
  const store = readStore();
  const nextStore = { ...store, settings };
  writeStore(nextStore);
  return settings;
}
