/*
  # Ecommerce Platform - Core Schema

  1. New Tables
    - `profiles` - User profiles extending auth.users with role, avatar, ban status
    - `categories` - Product categories with slug, image, description
    - `products` - Products (physical/virtual) with pricing, stock, images, variants
    - `addresses` - User shipping addresses
    - `orders` - Orders with status, payment, shipping tracking
    - `order_items` - Line items per order
    - `payments` - Stripe payment records
    - `reviews` - Product reviews with rating
    - `wishlists` - User product wishlists
    - `coupons` - Discount codes with expiration
    - `virtual_requests` - Service requests for virtual products
    - `notifications` - In-app notifications
    - `activity_logs` - Audit trail of user actions

  2. Enums
    - `user_role` - ADMIN, CUSTOMER, BUSINESS_MANAGER
    - `product_type` - PHYSICAL, VIRTUAL
    - `order_status` - PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
    - `payment_status` - PENDING, COMPLETED, FAILED, REFUNDED
    - `shipping_status` - PENDING, PROCESSING, SHIPPED, DELIVERED
    - `request_status` - PENDING, IN_PROGRESS, COMPLETED, CANCELLED

  3. Security
    - RLS enabled on ALL tables
    - Policies restrict data access based on auth.uid() and role
    - Admin has full access, business_manager has product/order access, customer has own data access
*/

-- Create enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'CUSTOMER', 'BUSINESS_MANAGER');
CREATE TYPE product_type AS ENUM ('PHYSICAL', 'VIRTUAL');
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE shipping_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED');
CREATE TYPE request_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  avatar text DEFAULT '',
  banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_price numeric(10,2) DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  sku text DEFAULT '',
  featured boolean DEFAULT false,
  type product_type NOT NULL DEFAULT 'PHYSICAL',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  images text[] DEFAULT '{}',
  variants jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  country text DEFAULT '',
  city text DEFAULT '',
  postal_code text DEFAULT '',
  line1 text DEFAULT '',
  line2 text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status order_status DEFAULT 'PENDING',
  payment_status payment_status DEFAULT 'PENDING',
  shipping_status shipping_status DEFAULT 'PENDING',
  address_id uuid REFERENCES addresses(id),
  coupon_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent text DEFAULT '',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'usd',
  status payment_status DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount numeric(5,2) NOT NULL DEFAULT 0,
  expiration_date timestamptz,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Virtual Requests
CREATE TABLE IF NOT EXISTS virtual_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  message text DEFAULT '',
  files text[] DEFAULT '{}',
  status request_status DEFAULT 'PENDING',
  admin_notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text DEFAULT '',
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION get_user_role(check_uid uuid)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = check_uid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==================== PROFILES POLICIES ====================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Business managers can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'BUSINESS_MANAGER');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN')
  WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = 'ADMIN' OR auth.uid() = id);

-- ==================== CATEGORIES POLICIES ====================
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins and managers can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'))
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==================== PRODUCTS POLICIES ====================
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins and managers can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'))
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==================== ADDRESSES POLICIES ====================
CREATE POLICY "Users can read own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== ORDERS POLICIES ====================
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and managers can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'))
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

-- ==================== ORDER ITEMS POLICIES ====================
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Admins and managers can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Users can insert order items for own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Admins and managers can update order items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'))
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

-- ==================== PAYMENTS POLICIES ====================
CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()));

CREATE POLICY "Admins can read all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "System can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN')
  WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');

-- ==================== REVIEWS POLICIES ====================
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==================== WISHLISTS POLICIES ====================
CREATE POLICY "Users can read own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==================== COUPONS POLICIES ====================
CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage coupons"
  ON coupons FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins and managers can update coupons"
  ON coupons FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'))
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Admins can delete coupons"
  ON coupons FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

-- ==================== VIRTUAL REQUESTS POLICIES ====================
CREATE POLICY "Users can read own virtual requests"
  ON virtual_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins and managers can read all virtual requests"
  ON virtual_requests FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

CREATE POLICY "Users can insert own virtual requests"
  ON virtual_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and managers can update virtual requests"
  ON virtual_requests FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'))
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER'));

-- ==================== NOTIFICATIONS POLICIES ====================
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER') OR auth.uid() = user_id);

-- ==================== ACTIVITY LOGS POLICIES ====================
CREATE POLICY "Admins can read all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role(auth.uid()) IN ('ADMIN', 'BUSINESS_MANAGER') OR auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_virtual_requests_status ON virtual_requests(status);
