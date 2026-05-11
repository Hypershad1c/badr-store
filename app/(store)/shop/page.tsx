'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ProductCard } from '@/components/shared/product-card';
import { ProductCardSkeleton } from '@/components/shared/skeletons';
import { EmptyState } from '@/components/shared/empty-state';
import { supabase } from '@/lib/supabase-client';
import { formatPrice } from '@/lib/utils';
import type { Product, Category, ProductType } from '@/types';

const ITEMS_PER_PAGE = 12;

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'best_selling';

interface Filters {
  categories: string[];
  priceRange: [number, number];
  productType: ProductType | null;
  featured: boolean;
  query: string;
  sort: SortOption;
  page: number;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price Low-High' },
  { value: 'price_desc', label: 'Price High-Low' },
  { value: 'best_selling', label: 'Best Selling' },
];

function FilterSidebar({
  filters,
  setFilters,
  categories,
  maxPrice,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  categories: Category[];
  maxPrice: number;
}) {
  const toggleCategory = (slug: string) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug],
    }));
  };

  const toggleProductType = (type: ProductType | null) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      productType: prev.productType === type ? null : type,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <Checkbox
                checked={filters.categories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {category.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Price Range</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={1}
          value={filters.priceRange}
          onValueChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              page: 1,
              priceRange: value as [number, number],
            }))
          }
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(filters.priceRange[0])}</span>
          <span>{formatPrice(filters.priceRange[1])}</span>
        </div>
      </div>

      <Separator />

      {/* Product Type */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Product Type</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={filters.productType === 'PHYSICAL'}
              onCheckedChange={() => toggleProductType('PHYSICAL')}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Physical
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={filters.productType === 'VIRTUAL'}
              onCheckedChange={() => toggleProductType('VIRTUAL')}
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Virtual / Service
            </span>
          </label>
        </div>
      </div>

      <Separator />

      {/* Featured Toggle */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Featured Only</h3>
          <Switch
            checked={filters.featured}
            onCheckedChange={(checked) =>
              setFilters((prev) => ({
                ...prev,
                page: 1,
                featured: checked,
              }))
            }
          />
        </div>
      </div>

      <Separator />

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          setFilters((prev) => ({
            ...prev,
            categories: [],
            priceRange: [0, maxPrice],
            productType: null,
            featured: false,
            page: 1,
          }))
        }
      >
        Clear All Filters
      </Button>
    </div>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    priceRange: [0, 1000],
    productType: null,
    featured: false,
    query: initialQuery,
    sort: 'newest',
    page: 1,
  });

  // Sync query param changes
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setFilters((prev) => ({ ...prev, query: q, page: 1 }));
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch max price
  useEffect(() => {
    const fetchMaxPrice = async () => {
      const { data } = await supabase
        .from('products')
        .select('price')
        .order('price', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        const max = Math.ceil(data[0].price);
        setMaxPrice(max);
        setFilters((prev) => ({ ...prev, priceRange: [0, max] }));
      }
    };
    fetchMaxPrice();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const from = (filters.page - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('*, category:categories(*)', { count: 'exact' });

      // Search
      if (filters.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%,short_description.ilike.%${filters.query}%`
        );
      }

      // Categories
      if (filters.categories.length > 0) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .in('slug', filters.categories);
        if (categoryData && categoryData.length > 0) {
          query = query.in(
            'category_id',
            categoryData.map((c) => c.id)
          );
        }
      }

      // Price range
      query = query.gte('price', filters.priceRange[0]).lte('price', filters.priceRange[1]);

      // Product type
      if (filters.productType) {
        query = query.eq('type', filters.productType);
      }

      // Featured
      if (filters.featured) {
        query = query.eq('featured', true);
      }

      // Sort
      switch (filters.sort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'best_selling':
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Pagination
      query = query.range(from, to);

      const { data, count } = await query;
      setProducts((data as Product[]) || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get('search') as string;
    router.push(`/shop${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.productType) count += 1;
    if (filters.featured) count += 1;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) count += 1;
    return count;
  }, [filters, maxPrice]);

  const paginationPages = useMemo(() => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (filters.page > 3) pages.push('ellipsis');
      const start = Math.max(2, filters.page - 1);
      const end = Math.min(totalPages - 1, filters.page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (filters.page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, filters.page]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="mt-1 text-muted-foreground">
          Browse our collection of products
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={filters.query}
            className="pl-9 pr-10"
          />
          {filters.query && (
            <button
              type="button"
              onClick={() => router.push('/shop')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          )}
        </div>
      </form>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            maxPrice={maxPrice}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      filters={filters}
                      setFilters={setFilters}
                      categories={categories}
                      maxPrice={maxPrice}
                    />
                  </div>
                  <div className="mt-6">
                    <SheetClose asChild>
                      <Button className="w-full">Apply Filters</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${totalCount} product${totalCount !== 1 ? 's' : ''}`}
              </p>
            </div>

            <Select
              value={filters.sort}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, sort: value as SortOption, page: 1 }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {filters.categories.map((slug) => {
                const cat = categories.find((c) => c.slug === slug);
                return (
                  <Button
                    key={slug}
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setFilters((prev) => ({
                        ...prev,
                        page: 1,
                        categories: prev.categories.filter((c) => c !== slug),
                      }));
                    }}
                  >
                    {cat?.name || slug}
                    <X className="h-3 w-3" />
                  </Button>
                );
              })}
              {filters.productType && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: 1, productType: null }))
                  }
                >
                  {filters.productType === 'PHYSICAL' ? 'Physical' : 'Virtual / Service'}
                  <X className="h-3 w-3" />
                </Button>
              )}
              {filters.featured && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: 1, featured: false }))
                  }
                >
                  Featured
                  <X className="h-3 w-3" />
                </Button>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: 1, priceRange: [0, maxPrice] }))
                  }
                >
                  {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    categories: [],
                    priceRange: [0, maxPrice],
                    productType: null,
                    featured: false,
                    page: 1,
                  }))
                }
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description={
                filters.query
                  ? `No results for "${filters.query}". Try adjusting your search or filters.`
                  : 'Try adjusting your filters to find what you are looking for.'
              }
              action={
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      categories: [],
                      priceRange: [0, maxPrice],
                      productType: null,
                      featured: false,
                      query: '',
                      sort: 'newest',
                      page: 1,
                    })
                  }
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {paginationPages.map((page, i) =>
                page === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-2 text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={filters.page === page ? 'default' : 'outline'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
