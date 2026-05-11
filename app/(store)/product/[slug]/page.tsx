'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Send,
  Package,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/shared/product-card';
import { ProductCardSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { supabase } from '@/lib/supabase-client';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import type { Product, Review } from '@/types';

const PEXELS_PLACEHOLDERS = [
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3738089/pexels-photo-3738089.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6765164/pexels-photo-6765164.jpeg?auto=compress&cs=tinysrgb&w=800',
];

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : i < rating
              ? 'fill-yellow-400/50 text-yellow-400'
              : 'text-muted-foreground/30'
          }
        />
      ))}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="py-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
          {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-sm font-medium">{review.user?.name || 'Anonymous'}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} size={12} />
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = product ? isInWishlist(product.id) : false;

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const productData = data as Product;
        setProduct(productData);

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, user:profiles(*)')
          .eq('product_id', productData.id)
          .order('created_at', { ascending: false });

        if (reviewData) setReviews(reviewData as Review[]);

        // Fetch related products
        if (productData.category_id) {
          const { data: relatedData } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('category_id', productData.category_id)
            .neq('id', productData.id)
            .limit(4);

          if (relatedData) setRelatedProducts(relatedData as Product[]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  // Derive images list
  const images = product?.images?.length
    ? product.images
    : PEXELS_PLACEHOLDERS;

  const discount = product
    ? getDiscountPercentage(product.price, product.compare_price)
    : 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const inStock = product ? product.stock > 0 : false;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (!product) return next;
      return Math.max(1, Math.min(next, product.stock));
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl bg-muted animate-pulse" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-6 w-1/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
            <div className="h-32 w-full rounded bg-muted animate-pulse" />
            <div className="h-12 w-full rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="mt-16">
          <div className="h-6 w-40 rounded bg-muted animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Product not found"
          description="The product you are looking for does not exist or has been removed."
          action={
            <Button asChild>
              <Link href="/shop">Browse Shop</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[selectedImage]}
                  alt={`${product.name} - Image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority={selectedImage === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1">
                -{discount}%
              </Badge>
            )}
            {product.type === 'VIRTUAL' && (
              <Badge variant="secondary" className="absolute top-4 right-4 text-sm px-3 py-1">
                Service
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative h-20 w-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  selectedImage === i
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-muted-foreground/30'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Name & Rating */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            {product.short_description && (
              <p className="mt-2 text-muted-foreground">
                {product.short_description}
              </p>
            )}
            {reviews.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <StarRating rating={averageRating} />
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews.length} review
                  {reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              {formatPrice(product.price)}
            </span>
            {product.compare_price > product.price && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compare_price)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  Save {discount}%
                </Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {product.type === 'VIRTUAL' ? (
              <div className="flex items-center gap-2 text-sm">
                <Send className="h-4 w-4 text-blue-500" />
                <span className="text-blue-600 font-medium">
                  Virtual / Service Product
                </span>
              </div>
            ) : inStock ? (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">In Stock</span>
                {product.stock <= 5 && (
                  <span className="text-orange-500 text-xs">
                    (Only {product.stock} left)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Quantity & Add to Cart / Request Service */}
          {product.type === 'VIRTUAL' ? (
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-12 text-base"
                onClick={() => {
                  // Navigate to service request flow
                  alert('Service request initiated! Our team will contact you shortly.');
                }}
              >
                <Send className="h-5 w-5 mr-2" />
                Request Service
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Submit a request and our team will get back to you with a custom quote
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-r-none"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="h-10 w-12 flex items-center justify-center text-sm font-medium border-x">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-l-none"
                    onClick={() => handleQuantityChange(1)}
                    disabled={!inStock || quantity >= product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12 text-base"
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-4"
                  onClick={() => toggleItem(product.id)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      wishlisted
                        ? 'fill-destructive text-destructive'
                        : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          )}

          {/* Virtual product wishlist */}
          {product.type === 'VIRTUAL' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toggleItem(product.id)}
            >
              <Heart
                className={`h-4 w-4 mr-2 ${
                  wishlisted ? 'fill-destructive text-destructive' : ''
                }`}
              />
              {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          )}

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium">Free Shipping</p>
                <p className="text-xs text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">256-bit SSL</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <RotateCcw className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">30-day policy</p>
              </div>
            </div>
          </div>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </motion.div>
      </div>

      {/* Description & Reviews Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12"
      >
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-6 py-3"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p>No detailed description available for this product.</p>
              )}
            </div>

            {/* Product Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Available Options</h3>
                <div className="space-y-4">
                  {product.variants.map((variant, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium mb-2">{variant.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((option, j) => (
                          <Badge key={j} variant="outline" className="px-3 py-1.5 cursor-pointer hover:bg-muted transition-colors">
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            {reviews.length === 0 ? (
              <EmptyState
                title="No reviews yet"
                description="Be the first to share your experience with this product."
                icon={<Star className="h-8 w-8" />}
              />
            ) : (
              <div>
                {/* Rating Summary */}
                <div className="flex items-center gap-4 mb-6 p-4 rounded-lg bg-muted/50">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
                    <StarRating rating={averageRating} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-16" />
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => Math.floor(r.rating) === star).length;
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-3">{star}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review List */}
                <div className="divide-y">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Related Products</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/shop?category=${product.category?.slug || ''}`}>
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}
