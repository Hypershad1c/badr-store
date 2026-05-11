'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order, Product, Profile } from '@/types';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
}

const revenueData = [
  { name: 'Mon', revenue: 3200, orders: 12 },
  { name: 'Tue', revenue: 4100, orders: 18 },
  { name: 'Wed', revenue: 2800, orders: 10 },
  { name: 'Thu', revenue: 5200, orders: 22 },
  { name: 'Fri', revenue: 4800, orders: 20 },
  { name: 'Sat', revenue: 6100, orders: 28 },
  { name: 'Sun', revenue: 5500, orders: 24 },
];

interface BestSeller {
  id: string;
  name: string;
  price: number;
  sold: number;
  image: string;
}

const bestSellers: BestSeller[] = [
  { id: '1', name: 'Premium Wireless Headphones', price: 129.99, sold: 156, image: '' },
  { id: '2', name: 'Smart Watch Pro', price: 249.99, sold: 132, image: '' },
  { id: '3', name: 'Ergonomic Keyboard', price: 89.99, sold: 98, image: '' },
  { id: '4', name: 'USB-C Hub Adapter', price: 49.99, sold: 87, image: '' },
  { id: '5', name: 'Noise Cancelling Earbuds', price: 79.99, sold: 76, image: '' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<(Order & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('profiles').select('id', { count: 'exact' }),
        ]);

        const orders = (ordersRes.data as (Order & { profile?: Profile })[]) || [];
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        const allOrdersRes = await supabase
          .from('orders')
          .select('total', { count: 'exact' })
          .eq('payment_status', 'COMPLETED');

        const completedRevenue = (allOrdersRes.data || []).reduce(
          (sum, o) => sum + (o.total || 0),
          0
        );

        setStats({
          totalRevenue: completedRevenue,
          totalOrders: allOrdersRes.count || 0,
          totalProducts: productsRes.count || 0,
          totalUsers: usersRes.count || 0,
        });

        setRecentOrders(orders);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      up: true,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+8.2%',
      up: true,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      change: '+3.1%',
      up: true,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950/50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '-2.4%',
      up: false,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
    },
  ];

  const statusColorMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    REFUNDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm">
                  {card.up ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={card.up ? 'text-emerald-600' : 'text-red-600'}>
                    {card.change}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Revenue for the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Best Sellers</CardTitle>
            <CardDescription>Top performing products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bestSellers.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sold} sold
                    </p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(product.price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest 5 orders placed on your store</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
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
                      <Badge
                        variant="secondary"
                        className={statusColorMap[order.status] || ''}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          order.payment_status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }
                      >
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
