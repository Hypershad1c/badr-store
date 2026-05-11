'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shared/product-card';
import { EmptyState } from '@/components/shared/empty-state';
import { supabase } from '@/lib/supabase-client';
import type { Product } from '@/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .or(
          `name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        setProducts([]);
      } else {
        setProducts((data as Product[]) || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        {query && (
          <p className="mt-1 text-muted-foreground">
            {loading
              ? 'Searching...'
              : `${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        )}
        {!query && (
          <p className="mt-1 text-muted-foreground">
            Enter a search term to find products
          </p>
        )}
      </div>

      {!query ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="Search for products"
          description="Use the search bar to find products by name or description."
          action={
            <Link href="/shop">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          }
        />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
          icon={<Search className="h-8 w-8" />}
          title={`No results for "${query}"`}
          description="Try adjusting your search terms or browse our products by category."
          action={
            <Link href="/shop">
              <Button variant="outline">Browse All Products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
