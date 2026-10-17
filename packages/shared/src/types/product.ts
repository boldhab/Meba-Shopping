export type DealType = "DAILY" | "WEEKLY" | "CLEARANCE" | "CEREMONY";

export type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";

export type ProductSort =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "stock-asc"
  | "stock-desc";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProductReviewDTO {
  id: string;
  rating: number;
  comment: string | null;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string | Date;
  user?: {
    id: string;
    name: string | null;
    email?: string;
  };
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  price: number | string;
  stock: number;
  status?: ProductStatus;
  dealType: DealType | null;
  isDealActive: boolean;
  dealStartAt: string | Date | null;
  dealEndAt: string | Date | null;
  isFeatured?: boolean;
  allowBackorder?: boolean;
  lowStockThreshold?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  attributes?: Record<string, unknown> | null;
  categoryId: string;
  category?: CategoryDTO;
  reviews?: ProductReviewDTO[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
