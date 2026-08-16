export type UUID = string;

export type Money = number;

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description: string | null;
  parentId: UUID | null;
  imageKey: string | null;
  isActive: boolean;
}

export interface Brand {
  id: UUID;
  name: string;
  slug: string;
  logoKey: string | null;
  isActive: boolean;
}

export interface ProductImage {
  id: UUID;
  productId: UUID;
  r2Key: string;
  position: number;
  altText: string | null;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  sku: string | null;
  brandId: UUID | null;
  brandName: string | null;
  description: string | null;
  price: Money;
  promotionalPrice: Money | null;
  stock: number;
  isActive: boolean;
  images: ProductImage[];
  categories: { id: UUID; name: string; slug: string }[];
}

export interface CartItem {
  id: UUID;
  cartId: UUID;
  productId: UUID;
  quantity: number;
}

export interface OrderItem {
  id: UUID;
  orderId: UUID;
  productId: UUID | null;
  productName: string;
  unitPrice: Money;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: UUID;
  userId: UUID;
  status: OrderStatus;
  currency: string;
  subtotal: Money;
  shippingCost: Money;
  discount: Money;
  total: Money;
  shippingAddress: unknown;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}

export type PromotionType = "percentage" | "fixed_amount";

export interface Promotion {
  id: UUID;
  code: string;
  name: string;
  type: PromotionType;
  value: Money;
  minOrderAmount: Money | null;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}