'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

const revenueOverTime = [
  { month: 'Jan', revenue: 12400 },
  { month: 'Feb', revenue: 15200 },
  { month: 'Mar', revenue: 13800 },
  { month: 'Apr', revenue: 18600 },
  { month: 'May', revenue: 21400 },
  { month: 'Jun', revenue: 19800 },
  { month: 'Jul', revenue: 23600 },
  { month: 'Aug', revenue: 25200 },
  { month: 'Sep', revenue: 22100 },
  { month: 'Oct', revenue: 28400 },
  { month: 'Nov', revenue: 31200 },
  { month: 'Dec', revenue: 34800 },
];

const ordersOverTime = [
  { month: 'Jan', orders: 145 },
  { month: 'Feb', orders: 178 },
  { month: 'Mar', orders: 162 },
  { month: 'Apr', orders: 210 },
  { month: 'May', orders: 245 },
  { month: 'Jun', orders: 228 },
  { month: 'Jul', orders: 270 },
  { month: 'Aug', orders: 295 },
  { month: 'Sep', orders: 260 },
  { month: 'Oct', orders: 312 },
  { month: 'Nov', orders: 348 },
  { month: 'Dec', orders: 380 },
];

const topProducts = [
  { name: 'Wireless Headphones', sales: 342 },
  { name: 'Smart Watch Pro', sales: 287 },
  { name: 'Ergonomic Keyboard', sales: 234 },
  { name: 'USB-C Hub', sales: 198 },
  { name: 'Monitor Stand', sales: 176 },
  { name: 'Webcam HD', sales: 154 },
  { name: 'Desk Lamp', sales: 132 },
];

const categoryDistribution = [
  { name: 'Electronics', value: 35, color: '#3b82f6' },
  { name: 'Accessories', value: 25, color: '#8b5cf6' },
  { name: 'Audio', value: 20, color: '#10b981' },
  { name: 'Peripherals', value: 12, color: '#f59e0b' },
  { name: 'Other', value: 8, color: '#6b7280' },
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Insights and metrics about your store performance.
        </p>
      </div>

      {/* Revenue + Orders Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
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
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [formatPrice(value), 'Revenue']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
            <CardDescription>Monthly orders for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
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
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${value}`, 'Orders']}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products + Category Distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products by units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${value} units`, 'Sales']}
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Sales breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={true}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name: string) => [
                      `${value}%`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Order Value</p>
            <p className="mt-1 text-2xl font-bold">{formatPrice(91.58)}</p>
            <p className="mt-1 text-xs text-emerald-600">+3.2% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="mt-1 text-2xl font-bold">3.4%</p>
            <p className="mt-1 text-xs text-emerald-600">+0.5% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Returning Customers</p>
            <p className="mt-1 text-2xl font-bold">42%</p>
            <p className="mt-1 text-xs text-red-600">-1.2% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
            <p className="mt-1 text-2xl font-bold">3.2 days</p>
            <p className="mt-1 text-xs text-emerald-600">-0.4 days vs last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
