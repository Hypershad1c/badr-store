'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);
  const discount = getDiscountPercentage(product.price, product.compare_price);
  const image = product.images?.[0] || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600';

  return (
    <div className="group relative rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            -{discount}%
          </Badge>
        )}
        {product.type === 'VIRTUAL' && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            Service
          </Badge>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem(product.id);
          }}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${wishlisted ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
        </button>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
          {product.short_description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold">{formatPrice(product.price)}</span>
            {product.compare_price > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
