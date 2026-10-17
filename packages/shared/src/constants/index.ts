export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export const PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "REFUNDED",
  "FAILED",
] as const;

export const DEAL_TYPES = [
  "DAILY",
  "WEEKLY",
  "CLEARANCE",
  "CEREMONY",
] as const;

export const PRODUCT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "DRAFT",
  "ARCHIVED",
] as const;

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;
