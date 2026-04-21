import { requestApi } from "./client";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
};

export type CartState = {
  items: CartItem[];
};

const CART_STORAGE_KEY = "meba.cart.items";

function readCartFromStorage(): CartState {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };

    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.items)) {
      return { items: [] };
    }

    return {
      items: parsed.items.filter((item) => typeof item?.productId === "string"),
    };
  } catch {
    return { items: [] };
  }
}

function writeCartToStorage(state: CartState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

function clearCartStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

function getItemIdentity(item: Pick<CartItem, "productId" | "variantId">) {
  return `${item.productId}::${item.variantId ?? "default"}`;
}

async function getServerCart(token: string): Promise<CartState> {
  return requestApi<CartState>("/cart", { token });
}

export async function getCart(token?: string | null): Promise<CartState> {
  if (token) {
    return getServerCart(token);
  }
  return readCartFromStorage();
}

export async function addCartItem(item: CartItem, token?: string | null): Promise<CartState> {
  if (token) {
    return requestApi<CartState>("/cart/items", {
      method: "POST",
      token,
      body: {
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
      },
    });
  }

  const current = readCartFromStorage();
  const nextItems = [...current.items];
  const incomingKey = getItemIdentity(item);
  const existingIndex = nextItems.findIndex((entry) => getItemIdentity(entry) === incomingKey);

  if (existingIndex >= 0) {
    const existing = nextItems[existingIndex];
    nextItems[existingIndex] = {
      ...existing,
      quantity: Math.min(existing.quantity + item.quantity, Math.max(item.stock, 0)),
    };
  } else {
    nextItems.push({
      ...item,
      quantity: Math.max(1, Math.min(item.quantity, Math.max(item.stock, 1))),
    });
  }

  const nextState = { items: nextItems.filter((entry) => entry.quantity > 0) };
  writeCartToStorage(nextState);
  return nextState;
}

export async function updateCartItemQuantity(
  productId: string,
  variantId: string | undefined,
  quantity: number,
  token?: string | null
): Promise<CartState> {
  if (token) {
    return requestApi<CartState>("/cart/items", {
      method: "PATCH",
      token,
      body: {
        productId,
        quantity,
        variantId,
      },
    });
  }

  const current = readCartFromStorage();
  const targetKey = `${productId}::${variantId ?? "default"}`;

  const nextItems = current.items
    .map((item) => {
      if (getItemIdentity(item) !== targetKey) return item;
      const safeQuantity = Math.max(0, Math.min(quantity, Math.max(item.stock, 0)));
      return { ...item, quantity: safeQuantity };
    })
    .filter((item) => item.quantity > 0);

  const nextState = { items: nextItems };
  writeCartToStorage(nextState);
  return nextState;
}

export async function removeCartItem(
  productId: string,
  variantId?: string,
  token?: string | null
): Promise<CartState> {
  if (token) {
    return requestApi<CartState>("/cart/items", {
      method: "DELETE",
      token,
      body: {
        productId,
        variantId,
      },
    });
  }

  const current = readCartFromStorage();
  const targetKey = `${productId}::${variantId ?? "default"}`;
  const nextState = {
    items: current.items.filter((item) => getItemIdentity(item) !== targetKey),
  };
  writeCartToStorage(nextState);
  return nextState;
}

export async function clearCart(token?: string | null): Promise<CartState> {
  if (token) {
    return requestApi<CartState>("/cart/clear", {
      method: "DELETE",
      token,
    });
  }

  const nextState = { items: [] };
  writeCartToStorage(nextState);
  return nextState;
}

export async function mergeGuestCartToServer(token: string): Promise<CartState> {
  const guestCart = readCartFromStorage();
  if (guestCart.items.length === 0) {
    return getServerCart(token);
  }

  const merged = await requestApi<CartState>("/cart/merge", {
    method: "POST",
    token,
    body: {
      items: guestCart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
      })),
    },
  });

  clearCartStorage();
  return merged;
}
