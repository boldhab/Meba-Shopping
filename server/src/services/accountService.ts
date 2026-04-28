import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "../utils/apiError";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Canceled" | "Returned";
export type PaymentStatus = "Paid" | "Unpaid" | "Refunded" | "Failed";
export type MessageCategory = "Sales" | "Support" | "Promotions";

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

type StoreRoot = {
  users: Record<string, AccountStore>;
};

const STORE_DIR = path.resolve(process.cwd(), "data");
const STORE_FILE = path.join(STORE_DIR, "account-store.json");

const defaultStore = (): AccountStore => ({
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
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function readRoot(): Promise<StoreRoot> {
  try {
    const raw = await readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreRoot;
    if (!parsed || typeof parsed !== "object" || !parsed.users) {
      return { users: {} };
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { users: {} };
    }
    throw error;
  }
}

async function writeRoot(root: StoreRoot) {
  await mkdir(STORE_DIR, { recursive: true });
  await writeFile(STORE_FILE, `${JSON.stringify(root, null, 2)}\n`, "utf8");
}

async function getUserStore(userId: string) {
  const root = await readRoot();
  const store = root.users[userId] ?? clone(defaultStore());
  root.users[userId] = store;
  await writeRoot(root);
  return { root, store };
}

async function updateUserStore(userId: string, updater: (store: AccountStore) => AccountStore) {
  const root = await readRoot();
  const currentStore = root.users[userId] ?? clone(defaultStore());
  const nextStore = updater(clone(currentStore));
  root.users[userId] = nextStore;
  await writeRoot(root);
  return nextStore;
}

function sanitizeStore(store: AccountStore) {
  return clone(store);
}

export const accountService = {
  async getOrders(userId: string) {
    const { store } = await getUserStore(userId);
    return sanitizeStore(store.orders);
  },

  async getOrder(userId: string, orderId: string) {
    const { store } = await getUserStore(userId);
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) {
      throw new ApiError(404, "Order not found.");
    }
    return sanitizeStore(order);
  },

  async cancelOrder(userId: string, orderId: string) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      orders: store.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              orderStatus: "Canceled",
              paymentStatus: order.paymentStatus === "Paid" ? "Refunded" : order.paymentStatus,
              canCancel: false,
              canReturn: false,
            }
          : order
      ),
    }));

    const order = nextStore.orders.find((item) => item.id === orderId);
    if (!order) throw new ApiError(404, "Order not found.");
    return sanitizeStore(order);
  },

  async returnOrder(userId: string, orderId: string) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      orders: store.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              orderStatus: "Returned",
              canCancel: false,
              canReturn: false,
            }
          : order
      ),
    }));

    const order = nextStore.orders.find((item) => item.id === orderId);
    if (!order) throw new ApiError(404, "Order not found.");
    return sanitizeStore(order);
  },

  async getWishlist(userId: string) {
    const { store } = await getUserStore(userId);
    return sanitizeStore(store.wishlist);
  },

  async addWishlistItem(userId: string, item: WishlistItem) {
    const nextStore = await updateUserStore(userId, (store) => {
      const existingIndex = store.wishlist.findIndex((entry) => entry.id === item.id);
      const wishlist = [...store.wishlist];
      if (existingIndex >= 0) {
        wishlist[existingIndex] = { ...wishlist[existingIndex], ...item };
      } else {
        wishlist.unshift(item);
      }
      return { ...store, wishlist };
    });

    return sanitizeStore(nextStore.wishlist);
  },

  async updateWishlistItem(userId: string, itemId: string, updates: Partial<WishlistItem>) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      wishlist: store.wishlist.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    }));
    return sanitizeStore(nextStore.wishlist);
  },

  async removeWishlistItem(userId: string, itemId: string) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      wishlist: store.wishlist.filter((item) => item.id !== itemId),
    }));
    return sanitizeStore(nextStore.wishlist);
  },

  async getMessages(userId: string) {
    const { store } = await getUserStore(userId);
    return sanitizeStore(store.messages);
  },

  async replyToMessage(userId: string, messageId: string, body: string) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      messages: store.messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              read: true,
              replies: [
                ...(message.replies ?? []),
                { body, timestamp: new Date().toISOString() },
              ],
            }
          : message
      ),
    }));
    const message = nextStore.messages.find((item) => item.id === messageId);
    if (!message) throw new ApiError(404, "Message not found.");
    return sanitizeStore(message);
  },

  async markMessageReadState(userId: string, messageId: string, read: boolean) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      messages: store.messages.map((message) => (message.id === messageId ? { ...message, read } : message)),
    }));
    const message = nextStore.messages.find((item) => item.id === messageId);
    if (!message) throw new ApiError(404, "Message not found.");
    return sanitizeStore(message);
  },

  async archiveMessage(userId: string, messageId: string) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      messages: store.messages.map((message) => (message.id === messageId ? { ...message, archived: true } : message)),
    }));
    const message = nextStore.messages.find((item) => item.id === messageId);
    if (!message) throw new ApiError(404, "Message not found.");
    return sanitizeStore(message);
  },

  async deleteMessage(userId: string, messageId: string) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      messages: store.messages.filter((message) => message.id !== messageId),
    }));
    return sanitizeStore(nextStore.messages);
  },

  async getSettings(userId: string) {
    const { store } = await getUserStore(userId);
    return sanitizeStore(store.settings);
  },

  async updateSettings(userId: string, settings: AccountSettings) {
    const nextStore = await updateUserStore(userId, (store) => ({
      ...store,
      settings,
    }));
    return sanitizeStore(nextStore.settings);
  },

  async getUnreadMessageCount(userId: string) {
    const { store } = await getUserStore(userId);
    return store.messages.filter((message) => !message.read && !message.archived).length;
  },
};
