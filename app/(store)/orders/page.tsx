'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Package, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase-client';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Order, OrderItem } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
  SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200',
};

interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product: {
      id: string;
      name: string;
      slug: string;
      images: string[];
      price: number;
    } | null;
  })[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, product:products(*))')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        } else {
          setOrders((data as OrderWithItems[]) || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, authLoading, router]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

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
          title="Sign in to view your orders"
          description="You need to be logged in to view your order history."
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
        <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
        <p className="mt-1 text-muted-foreground">
          {orders.length > 0
            ? `You have ${orders.length} order${orders.length !== 1 ? 's' : ''}`
            : 'Your order history will appear here'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-5 w-20 bg-muted rounded" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-48 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="No orders yet"
          description="When you place your first order, it will appear here."
          action={
            <Button onClick={() => router.push('/shop')}>Start Shopping</Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const itemCount = order.order_items?.reduce(
              (sum, item) => sum + item.quantity,
              0
            ) || 0;

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-base font-mono">
                        #{order.id.slice(0, 8)}
                      </CardTitle>
                      <Badge
                        className={STATUS_COLORS[order.status] || ''}
                        variant="outline"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                  </div>
                </CardContent>

                {isExpanded && order.order_items && order.order_items.length > 0 && (
                  <div className="border-t">
                    <div className="p-4">
                      <h4 className="text-sm font-semibold mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.order_items.map((item) => {
                          const productImage =
                            item.product?.images?.[0] ||
                            'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=600';

                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 rounded-lg border p-3"
                            >
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                                <Image
                                  src={productImage}
                                  alt={item.product?.name || 'Product'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.product?.name || 'Unknown Product'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {item.quantity} x {formatPrice(item.price)}
                                </p>
                              </div>
                              <p className="text-sm font-semibold">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <span className="text-sm font-semibold">Total</span>
                        <span className="text-base font-bold">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
