/*
  # Seed Data - Demo Categories, Products, and Coupons

  1. Categories (6)
    - Electronics, Clothing, Home & Living, Sports, Digital Services, Design Services

  2. Products (12)
    - Mix of physical and virtual products across categories
    - Featured products included
    - Realistic pricing and stock levels

  3. Coupons (3)
    - WELCOME10, SAVE20, FIRST5
*/

-- Insert categories
INSERT INTO categories (name, slug, image, description) VALUES
  ('Electronics', 'electronics', 'https://images.pexels.com/photos/1096837/pexels-photo-1096837.jpeg?auto=compress&cs=tinysrgb&w=400', 'Latest gadgets and tech essentials'),
  ('Clothing', 'clothing', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400', 'Premium apparel and accessories'),
  ('Home & Living', 'home-living', 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400', 'Elevate your living space'),
  ('Sports', 'sports', 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400', 'Gear up for any sport'),
  ('Digital Services', 'digital-services', 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=400', 'Professional digital solutions'),
  ('Design Services', 'design-services', 'https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=400', 'Creative design at your service')
ON CONFLICT (slug) DO NOTHING;

-- Insert products (category_id references will be resolved by subquery)
INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Wireless Noise-Cancelling Headphones', 'wireless-headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for music lovers and professionals who demand the best sound quality.', 'Premium ANC headphones', 299.99, 399.99, 45, 'WH-001', true, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600', 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Color","options":["Black","Silver","Navy"]}]'::jsonb
FROM categories c WHERE c.slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Smart Fitness Watch', 'smart-fitness-watch', 'Track your health and fitness goals with our advanced smartwatch featuring heart rate monitoring, GPS, and 7-day battery life.', 'Advanced fitness tracking', 199.99, 249.99, 78, 'SW-002', true, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Size","options":["40mm","44mm"]}]'::jsonb
FROM categories c WHERE c.slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Premium Leather Jacket', 'premium-leather-jacket', 'Handcrafted genuine leather jacket with a modern slim fit. Timeless style meets exceptional comfort.', 'Genuine leather, modern fit', 449.99, 599.99, 20, 'LJ-003', true, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Size","options":["S","M","L","XL"]}]'::jsonb
FROM categories c WHERE c.slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Minimalist Desk Lamp', 'minimalist-desk-lamp', 'Elegant LED desk lamp with adjustable brightness, color temperature control, and wireless charging base.', 'LED lamp with wireless charging', 89.99, 0, 120, 'DL-004', false, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[]'::jsonb
FROM categories c WHERE c.slug = 'home-living'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Professional Running Shoes', 'professional-running-shoes', 'Engineered for performance with responsive cushioning, breathable mesh upper, and durable outsole for road and trail running.', 'High-performance running shoes', 159.99, 199.99, 55, 'RS-005', false, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Size","options":["8","9","10","11","12"]}]'::jsonb
FROM categories c WHERE c.slug = 'sports'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Portable Bluetooth Speaker', 'portable-bluetooth-speaker', 'Waterproof portable speaker with 360-degree sound, 20-hour battery, and built-in microphone for calls.', 'Waterproof 360-degree sound', 129.99, 169.99, 90, 'BS-006', false, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/1279365/pexels-photo-1279365.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Color","options":["Black","Blue","Red"]}]'::jsonb
FROM categories c WHERE c.slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Web Development Service', 'web-development-service', 'Full-stack web development from design to deployment. We build responsive, performant web applications using modern technologies like React, Next.js, and Node.js.', 'Custom web development', 2499.99, 0, 999, 'WD-007', true, 'VIRTUAL', c.id,
  ARRAY['https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[]'::jsonb
FROM categories c WHERE c.slug = 'digital-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'UI/UX Design Package', 'ui-ux-design-package', 'Complete UI/UX design service including user research, wireframing, prototyping, and high-fidelity mockups in Figma.', 'Professional UI/UX design', 1499.99, 1999.99, 999, 'UD-008', true, 'VIRTUAL', c.id,
  ARRAY['https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Package","options":["Starter","Professional","Enterprise"]}]'::jsonb
FROM categories c WHERE c.slug = 'design-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Discord Server Setup', 'discord-server-setup', 'Professional Discord server setup with custom bots, role hierarchy, channel structure, moderation tools, and community management features.', 'Custom Discord setup', 299.99, 0, 999, 'DS-009', false, 'VIRTUAL', c.id,
  ARRAY['https://images.pexels.com/photos/7234235/pexels-photo-7234235.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[]'::jsonb
FROM categories c WHERE c.slug = 'digital-services'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Cashmere Sweater', 'cashmere-sweater', 'Luxuriously soft 100% cashmere sweater. Lightweight yet warm, perfect for layering or wearing on its own.', '100% cashmere', 279.99, 349.99, 30, 'CS-010', false, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/6765164/pexels-photo-6765164.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Size","options":["XS","S","M","L","XL"]}]'::jsonb
FROM categories c WHERE c.slug = 'clothing'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Smart Home Hub', 'smart-home-hub', 'Central hub for all your smart home devices. Voice control, automation routines, and compatibility with 500+ smart devices.', 'Control your smart home', 149.99, 199.99, 65, 'SH-011', false, 'PHYSICAL', c.id,
  ARRAY['https://images.pexels.com/photos/4040663/pexels-photo-4040663.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[]'::jsonb
FROM categories c WHERE c.slug = 'electronics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, short_description, price, compare_price, stock, sku, featured, type, category_id, images, variants)
SELECT 'Game Boosting Service', 'game-boosting-service', 'Professional game boosting for ranked play. Our expert players will help you reach your desired rank quickly and safely.', 'Reach your desired rank', 49.99, 0, 999, 'GB-012', false, 'VIRTUAL', c.id,
  ARRAY['https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=600'],
  '[{"name":"Rank","options":["Bronze-Silver","Silver-Gold","Gold-Platinum","Platinum-Diamond"]}]'::jsonb
FROM categories c WHERE c.slug = 'digital-services'
ON CONFLICT (slug) DO NOTHING;

-- Insert sample coupons
INSERT INTO coupons (code, discount, expiration_date, active) VALUES
  ('WELCOME10', 10.00, '2027-12-31', true),
  ('SAVE20', 20.00, '2027-06-30', true),
  ('FIRST5', 5.00, '2027-12-31', true)
ON CONFLICT (code) DO NOTHING;
