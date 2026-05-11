'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ShoppingCart,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { formatPrice, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Order, OrderItem, OrderStatus, PaymentStatus, ShippingStatus, Profile } from '@/types';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const shippingStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<(Order & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(Order & { profile?: Profile; order_items?: (OrderItem & { product?: { name: string; images: string[] } })[] }) | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as (Order & { profile?: Profile })[]);
    }
    setLoading(false);
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
    setUpdating(null);
  }

  async function updatePaymentStatus(orderId: string, payment_status: PaymentStatus) {
    setUpdating(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status } : o))
      );
    }
    setUpdating(null);
  }

  async function updateShippingStatus(orderId: string, shipping_status: ShippingStatus) {
    setUpdating(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ shipping_status })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, shipping_status } : o))
      );
    }
    setUpdating(null);
  }

  async function openOrderDetail(order: Order & { profile?: Profile }) {
    const { data: items } = await supabase
      .from('order_items')
      .select('*, product:products(name, images)')
      .eq('order_id', order.id);

    setSelectedOrder({ ...order, order_items: (items || []) as (OrderItem & { product?: { name: string; images: string[] } })[] });
    setDetailDialogOpen(true);
  }

  const toggleExpanded = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const orderStatuses: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  const paymentStatuses: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
  const shippingStatuses: ShippingStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track customer orders. {orders.length} orders total.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by status:</span>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusFilter !== 'all' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Clear filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                {statusFilter !== 'all'
                  ? `No orders with status "${statusFilter}".`
                  : 'No orders yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]" />
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <>
                    <TableRow key={order.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleExpanded(order.id)}
                        >
                          {expandedOrder === order.id ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {order.profile?.name || order.user_id.slice(0, 8) + '...'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            updateOrderStatus(order.id, v as OrderStatus)
                          }
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue>
                              <Badge
                                variant="secondary"
                                className={statusColors[order.status] || ''}
                              >
                                {order.status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {orderStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.payment_status}
                          onValueChange={(v) =>
                            updatePaymentStatus(order.id, v as PaymentStatus)
                          }
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue>
                              <Badge
                                variant="secondary"
                                className={paymentStatusColors[order.payment_status] || ''}
                              >
                                {order.payment_status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {paymentStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.shipping_status}
                          onValueChange={(v) =>
                            updateShippingStatus(order.id, v as ShippingStatus)
                          }
                          disabled={updating === order.id}
                        >
                          <SelectTrigger className="h-7 w-[130px] text-xs">
                            <SelectValue>
                              <Badge
                                variant="secondary"
                                className={shippingStatusColors[order.shipping_status] || ''}
                              >
                                {order.shipping_status}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {shippingStatuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openOrderDetail(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedOrder === order.id && (
                      <TableRow key={`${order.id}-expanded`}>
                        <TableCell colSpan={9} className="bg-muted/30 px-8 py-4">
                          <div className="grid gap-4 text-sm sm:grid-cols-3">
                            <div>
                              <p className="font-medium text-muted-foreground">Order ID</p>
                              <p className="font-mono">{order.id}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">User ID</p>
                              <p className="font-mono text-xs">{order.user_id}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">Total</p>
                              <p className="font-semibold">{formatPrice(order.total)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">Created</p>
                              <p>{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">Updated</p>
                              <p>{formatDate(order.updated_at)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">Address ID</p>
                              <p className="font-mono text-xs">{order.address_id}</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order {selectedOrder?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order ID</p>
                  <p className="font-mono text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="text-sm">
                    {selectedOrder.profile?.name || selectedOrder.user_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Status</p>
                  <Badge
                    variant="secondary"
                    className={statusColors[selectedOrder.status] || ''}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                  <Badge
                    variant="secondary"
                    className={paymentStatusColors[selectedOrder.payment_status] || ''}
                  >
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Shipping Status</p>
                  <Badge
                    variant="secondary"
                    className={shippingStatusColors[selectedOrder.shipping_status] || ''}
                  >
                    {selectedOrder.shipping_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{formatPrice(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated</p>
                  <p className="text-sm">{formatDate(selectedOrder.updated_at)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-sm font-semibold">Order Items</h3>
                {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.product?.name || 'Product'}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.price)}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No items found.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
