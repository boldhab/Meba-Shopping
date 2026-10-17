export interface CartItemDTO {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
  variantId?: string;
  variantLabel?: string;
}

export interface CartTotalsDTO {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CartRuleConfigDTO {
  minCartValue: number;
  maxQuantityPerProduct: number;
  freeShippingThreshold: number;
  taxRatePercent: number;
  abandonedHours: number;
}

export interface CartValidationDTO {
  minCartValueGap: number;
  meetsMinimumCartValue: boolean;
  stockIssues: Array<{
    productId: string;
    name: string;
    requestedQuantity: number;
    availableStock: number;
  }>;
  quantityIssues: Array<{
    productId: string;
    name: string;
    requestedQuantity: number;
    maxAllowed: number;
  }>;
  checkoutAllowed: boolean;
}

export interface CartQuoteDTO {
  items: Array<CartItemDTO & { id: string }>;
  couponCode: string | null;
  totals: CartTotalsDTO;
  rules: CartRuleConfigDTO;
  validation: CartValidationDTO;
}
