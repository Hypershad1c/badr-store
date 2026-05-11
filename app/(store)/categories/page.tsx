'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import type { Category } from '@/types';

const PEXELS_IMAGES = [
  'https://images.pexels.com/photos/1096837/pexels-photo-1096837.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400',
];

interface CategoryWithCount extends Category {
  product_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoryError) {
          console.error('Error fetching categories:', categoryError);
          setCategories([]);
          return;
        }

        const categoriesWithCounts: CategoryWithCount[] = await Promise.all(
          (categoryData as Category[]).map(async (category, index) => {
            const { count } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id);

            return {
              ...category,
              image: category.image || PEXELS_IMAGES[index % PEXELS_IMAGES.length],
              product_count: count ?? 0,
            };
          })
        );

        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-muted-foreground">
          Browse our collection by category
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[4/3] bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-5 w-24 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h.01" />
              <path d="M17 7h.01" />
              <path d="M7 17h.01" />
              <path d="M17 17h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No categories found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Categories will appear here once they are added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={`/shop?category=${category.slug}`}>
                <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={category.image || PEXELS_IMAGES[i % PEXELS_IMAGES.length]}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {category.description}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {category.product_count} {category.product_count === 1 ? 'product' : 'products'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
