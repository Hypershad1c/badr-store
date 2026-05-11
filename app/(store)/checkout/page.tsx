'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  MapPin,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatPrice } from '@/lib/utils';

// ── Schemas ────────────────────────────────────────────────────────────────

const shippingSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// ── Step definitions ───────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Shipping', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: Package },
] as const;

// ── Pexels placeholder ────────────────────────────────────────────────────

const PEXELS_PLACEHOLDER =
  'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600';

// ── Component ──────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const clearCart = useCartStore((s) => s.clearCart);

  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [shippingAddress, setShippingAddress] =
    useState<ShippingFormValues | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const subtotal = total();
  const hasPhysical = items.some((item) => item.product?.type === 'PHYSICAL');
  const shipping = hasPhysical ? 9.99 : 0;
  const discount = couponApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const orderTotal = subtotal + shipping - discount;

  // ── Shipping form ──────────────────────────────────────────────────────

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      line1: '',
      line2: '',
      city: '',
      postal_code: '',
      country: '',
    },
  });

  // ── Step handlers ──────────────────────────────────────────────────────

  const onShippingSubmit = (data: ShippingFormValues) => {
    setShippingAddress(data);
    setStep(2);
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponApplied(true);
  };

  const handleSimulatedPayment = async () => {
    if (!user) {
      setError('You must be signed in to complete your order.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. Insert or find the address
      const { data: addressData, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          line1: shippingAddress!.line1,
          line2: shippingAddress!.line2 || '',
          city: shippingAddress!.city,
          postal_code: shippingAddress!.postal_code,
          country: shippingAddress!.country,
        })
        .select('id')
        .single();

      if (addressError) throw addressError;
      const addressId = addressData.id;

      // 2. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: orderTotal,
          status: 'PENDING',
          payment_status: 'PENDING',
          shipping_status: hasPhysical ? 'PENDING' : 'DELIVERED',
          address_id: addressId,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;
      const orderId = orderData.id;

      // 3. Create order items
      const orderItems = items.map((item) => ({
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product?.price ?? 0,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Create a payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          stripe_payment_intent: `sim_${Date.now()}`,
          amount: orderTotal,
          currency: 'usd',
          status: 'COMPLETED',
        });

      if (paymentError) throw paymentError;

      // 5. Update order payment status to COMPLETED
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: 'COMPLETED' })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // 6. Clear the cart
      clearCart();

      // 7. Redirect to success
      router.push('/checkout/success');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Step indicator ─────────────────────────────────────────────────────

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, idx) => {
        const isActive = step === s.id;
        const isComplete = step > s.id;
        const Icon = s.icon;

        return (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isComplete
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {isComplete ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="h-px w-8 bg-border" />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Empty cart guard ───────────────────────────────────────────────────

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <StepIndicator />
        <div className="mt-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Add some items before checking out.
          </p>
          <Button asChild>
            <a href="/shop">Browse Shop</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <StepIndicator />

      {/* ── Step 1: Shipping ──────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onShippingSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="line1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="line2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 2</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Apt, suite, unit (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="United States" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" asChild>
                    <a href="/cart">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Cart
                    </a>
                  </Button>
                  <Button type="submit">
                    Continue to Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Payment ──────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const product = item.product;
                const image = product?.images?.[0] || PEXELS_PLACEHOLDER;
                return (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={image}
                        alt={product?.name || 'Product'}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} &middot;{' '}
                        {formatPrice(product?.price ?? 0)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice((product?.price ?? 0) * item.quantity)}
                    </span>
                  </div>
                );
              })}

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
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
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount (10%)</span>
                  <span className="text-green-600">
                    -{formatPrice(discount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coupon Code</CardTitle>
            </CardHeader>
            <CardContent>
              {couponApplied ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{couponCode}</Badge>
                    <span className="text-sm text-green-600">10% off applied</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setCouponApplied(false);
                      setCouponCode('');
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
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
            </CardContent>
          </Card>

          {/* Pay Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep(3)}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Review
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shipping
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Step 3: Review ────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shippingAddress && (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p>{shippingAddress.line1}</p>
                  {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.postal_code}
                  </p>
                  <p>{shippingAddress.country}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => {
                const product = item.product;
                const image = product?.images?.[0] || PEXELS_PLACEHOLDER;
                return (
                  <div key={item.product_id} className="flex gap-3">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={image}
                        alt={product?.name || 'Product'}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {product?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity} &middot;{' '}
                        {formatPrice(product?.price ?? 0)} each
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice((product?.price ?? 0) * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
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
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount (10%)</span>
                  <span className="text-green-600">
                    -{formatPrice(discount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(orderTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Confirm & Pay */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {error && (
                <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleSimulatedPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {formatPrice(orderTotal)} with Stripe
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep(2)}
                disabled={isProcessing}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
