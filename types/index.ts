export type UserRole = 'ADMIN' | 'CUSTOMER' | 'BUSINESS_MANAGER';
export type ProductType = 'PHYSICAL' | 'VIRTUAL';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ShippingStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
export type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number;
  stock: number;
  sku: string;
  featured: boolean;
  type: ProductType;
  category_id: string;
  images: string[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
  category?: Category;
  reviews?: Review[];
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Address {
  id: string;
  user_id: string;
  country: string;
  city: string;
  postal_code: string;
  line1: string;
  line2: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus;
  address_id: string;
  coupon_id?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  address?: Address;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product?: Product;
}

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: Profile;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiration_date: string;
  active: boolean;
  created_at: string;
}

export interface VirtualRequest {
  id: string;
  user_id: string;
  product_id: string;
  message: string;
  files: string[];
  status: RequestStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  product?: Product;
  user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}
