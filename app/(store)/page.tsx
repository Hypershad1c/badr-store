'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Package, Server, Shield, Sparkles, Truck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/shared/product-card';
import { ProductCardSkeleton } from '@/components/shared/skeletons';
import type { Product, Category } from '@/types';

const placeholderProducts: Product[] = [
  {
    id: '1',
    name: 'Artisan Leather Bag',
    slug: 'artisan-leather-bag',
    description: 'Handcrafted premium leather bag with meticulous attention to detail and timeless design.',
    short_description: 'Handcrafted premium leather bag',
    price: 189.99,
    compare_price: 249.99,
    stock: 15,
    sku: 'ALB-001',
    featured: true,
    type: 'PHYSICAL',
    category_id: 'cat-1',
    images: ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Designer Sunglasses',
    slug: 'designer-sunglasses',
    description: 'Premium designer sunglasses with UV protection and polarized lenses for ultimate comfort.',
    short_description: 'Premium UV-protection sunglasses',
    price: 129.99,
    compare_price: 179.99,
    stock: 30,
    sku: 'DS-002',
    featured: true,
    type: 'PHYSICAL',
    category_id: 'cat-2',
    images: ['https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    description: 'Noise-cancelling wireless headphones with studio-quality sound and 30-hour battery life.',
    short_description: 'Studio-quality noise-cancelling',
    price: 249.99,
    compare_price: 299.99,
    stock: 20,
    sku: 'WH-003',
    featured: true,
    type: 'PHYSICAL',
    category_id: 'cat-3',
    images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Minimalist Watch',
    slug: 'minimalist-watch',
    description: 'Elegant minimalist watch with Swiss movement and sapphire crystal glass.',
    short_description: 'Swiss movement sapphire crystal',
    price: 349.99,
    compare_price: 449.99,
    stock: 10,
    sku: 'MW-004',
    featured: true,
    type: 'PHYSICAL',
    category_id: 'cat-4',
    images: ['https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const placeholderCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Fashion',
    slug: 'fashion',
    image: 'https://images.pexels.com/photos/1096837/pexels-photo-1096837.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Discover the latest trends in fashion and accessories',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Cutting-edge electronics and gadgets',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    slug: 'home-living',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Transform your living space with premium home decor',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Beauty',
    slug: 'beauty',
    image: 'https://images.pexels.com/photos/1096837/pexels-photo-1096837.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium beauty and skincare products',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-5',
    name: 'Sports',
    slug: 'sports',
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Gear up with premium sports equipment',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-6',
    name: 'Books',
    slug: 'books',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Bestselling books and educational material',
    created_at: new Date().toISOString(),
  },
];

const bestSellerProducts: Product[] = [
  {
    id: '5',
    name: 'Premium Backpack',
    slug: 'premium-backpack',
    description: 'Durable premium backpack with laptop compartment and water-resistant fabric.',
    short_description: 'Water-resistant laptop backpack',
    price: 119.99,
    compare_price: 159.99,
    stock: 25,
    sku: 'PB-005',
    featured: false,
    type: 'PHYSICAL',
    category_id: 'cat-1',
    images: ['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Smart Home Speaker',
    slug: 'smart-home-speaker',
    description: 'Voice-controlled smart speaker with immersive sound and smart home integration.',
    short_description: 'Voice-controlled smart speaker',
    price: 199.99,
    compare_price: 249.99,
    stock: 18,
    sku: 'SHS-006',
    featured: false,
    type: 'PHYSICAL',
    category_id: 'cat-2',
    images: ['https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Ceramic Vase Set',
    slug: 'ceramic-vase-set',
    description: 'Elegant handcrafted ceramic vase set perfect for modern home decor.',
    short_description: 'Handcrafted ceramic vase set',
    price: 79.99,
    compare_price: 99.99,
    stock: 40,
    sku: 'CVS-007',
    featured: false,
    type: 'PHYSICAL',
    category_id: 'cat-3',
    images: ['https://images.pexels.com/photos/1667088/pexels-photo-1667088.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Fitness Tracker Pro',
    slug: 'fitness-tracker-pro',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life.',
    short_description: 'Advanced GPS fitness tracker',
    price: 149.99,
    compare_price: 199.99,
    stock: 35,
    sku: 'FTP-008',
    featured: false,
    type: 'PHYSICAL',
    category_id: 'cat-4',
    images: ['https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=600'],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase.from('products').select('*, category:categories(*)').eq('featured', true).limit(4),
          supabase.from('categories').select('*').limit(6),
        ]);

        const fetchedProducts = productsRes.data as Product[] | null;
        const fetchedCategories = categoriesRes.data as Category[] | null;

        if (fetchedProducts && fetchedProducts.length > 0) {
          setFeaturedProducts(fetchedProducts);
        } else {
          setFeaturedProducts(placeholderProducts);
        }

        if (fetchedCategories && fetchedCategories.length > 0) {
          setCategories(fetchedCategories);
        } else {
          setCategories(placeholderCategories);
        }
      } catch {
        setFeaturedProducts(placeholderProducts);
        setCategories(placeholderCategories);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm backdrop-blur-sm mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>New Collection Available</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Premium Products
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed sm:text-xl">
              Curated selection of high-quality products and services designed for those who appreciate the finer things. Quality meets elegance in every detail.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-6 py-3 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:shadow-md"
              >
                Browse Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeUp}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Products</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Handpicked selections from our latest collection
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ProductCardSkeleton />
                  </motion.div>
                ))
              : featuredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true, margin: '-50px' }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              View all products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeUp}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Shop by Category</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find exactly what you are looking for
            </p>
          </motion.div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:gap-6 sm:overflow-visible sm:pb-0">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: '-50px' }}
                className="snap-start"
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="group relative flex flex-col items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 min-w-[140px] sm:min-w-0"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <span className="text-sm font-medium text-center">{category.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeUp}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Best Sellers</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Our most popular products loved by customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellerProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: '-50px' }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeUp}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Virtual Services</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Professional services delivered digitally, no shipping required
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Server,
                title: 'Digital Consultations',
                description: 'Get expert advice from industry professionals through one-on-one virtual sessions tailored to your needs.',
              },
              {
                icon: Package,
                title: 'Custom Design Services',
                description: 'Professional graphic design, branding, and creative services delivered directly to your inbox.',
              },
              {
                icon: Zap,
                title: 'Instant Digital Products',
                description: 'Templates, courses, and digital assets available for immediate download after purchase.',
              },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true, margin: '-50px' }}
                className="group rounded-xl border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{service.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeUp}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Us</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We are committed to delivering exceptional quality and service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Your transactions are protected with industry-standard encryption and security protocols.',
              },
              {
                icon: Truck,
                title: 'Fast Shipping',
                description: 'Quick and reliable delivery with real-time tracking on all physical product orders.',
              },
              {
                icon: Sparkles,
                title: 'Premium Quality',
                description: 'Every product is carefully curated and quality-checked before reaching you.',
              },
              {
                icon: Zap,
                title: 'Instant Access',
                description: 'Digital products and services are available immediately after purchase.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: '-50px' }}
                className="text-center"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24">
        <motion.div
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-50px' }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to get started?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Join thousands of satisfied customers and discover premium products and services tailored to your lifestyle.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-6 py-3 text-sm font-medium text-primary shadow-sm transition-all hover:bg-primary-foreground/90 hover:shadow-md"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-foreground/30 px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-foreground/10 hover:shadow-md"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
