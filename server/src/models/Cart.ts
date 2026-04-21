export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  variantId: string | null;
  variantLabel: string | null;
};

export type Cart = {
  items: CartItem[];
  total: number;
};
