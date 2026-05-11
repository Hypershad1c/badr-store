'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';

const PEXELS_PLACEHOLDER =
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartStore((s) => s.total);

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const subtotal = total();
  const hasPhysical = items.some((item) => item.product?.type === 'PHYSICAL');
  const shipping = hasPhysical ? 9.99 : 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const orderTotal = subtotal + shipping - discount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      setCouponApplied(false);
      return;
    }
    // Simulated coupon validation
    setCouponApplied(true);
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponCode('');
    setCouponError('');
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8" />}
          title="Your cart is empty"
          description="Looks like you haven't added any items to your cart yet."
          action={
            <Button asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="mt-1 text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const image = product?.images?.[0] || PEXELS_PLACEHOLDER;
            const lineTotal = (product?.price ?? 0) * item.quantity;

            return (
              <Card key={item.product_id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={image}
                        alt={product?.name || 'Product image'}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <Link
                          href={`/product/${product?.slug}`}
                          className="font-semibold text-sm sm:text-base hover:underline line-clamp-2"
                        >
                          {product?.name || 'Unknown Product'}
                        </Link>
                        {product?.type && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {product.type === 'VIRTUAL' ? 'Digital' : 'Physical'}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(product?.price ?? 0)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.product_id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">
                            {formatPrice(lineTotal)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeItem(item.product_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Continue Shopping */}
          <div className="pt-2">
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>

              {/* Discount */}
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount (10%)</span>
                  <span className="text-green-600">
                    -{formatPrice(discount)}
                  </span>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>

              <Separator />

              {/* Coupon Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Code</label>
                {couponApplied ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">
                      {couponCode} applied
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-muted-foreground hover:text-destructive"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      className="h-9"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0"
                      onClick={handleApplyCoupon}
                    >
                      Apply
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
              </div>

              <Separator />

              {/* Proceed to Checkout */}
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
