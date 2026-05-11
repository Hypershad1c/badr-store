'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import type { Product } from '@/types';

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items: wishlistIds, removeItem } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .in('id', wishlistIds);

        if (error) {
          console.error('Error fetching wishlist products:', error);
          setProducts([]);
        } else {
          setProducts((data as Product[]) || []);
        }
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchWishlistProducts();
    }
  }, [wishlistIds, user]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<LogIn className="h-8 w-8" />}
          title="Sign in to view your wishlist"
          description="You need to be logged in to save and view your favorite products."
          action={
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="mt-1 text-muted-foreground">
          {products.length > 0
            ? `You have ${products.length} item${products.length !== 1 ? 's' : ''} in your wishlist`
            : 'Your wishlist is empty'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-card overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted rounded" />
                <div className="h-5 w-1/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-8 w-8" />}
          title="Your wishlist is empty"
          description="Start adding products you love to your wishlist by clicking the heart icon on any product."
          action={
            <Button onClick={() => router.push('/shop')}>Browse Products</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeItem(product.id)}
              >
                <Heart className="h-4 w-4 fill-current mr-1" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
