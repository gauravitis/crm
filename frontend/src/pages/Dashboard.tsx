import React, { useState } from 'react';
import { Users, Package, IndianRupee, Loader, TrendingUp, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Link } from 'react-router-dom';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Bar } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

// Helper function to format dates
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Dashboard() {
  const { stats, loading, error } = useDashboardStats();
  const [dateRange, setDateRange] = useState('30'); // days

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select 
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <Button 
              onClick={() => window.location.reload()}
              size="sm"
              className="gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.salesMetrics.growthRate >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">
                      {stats.salesMetrics.growthRate.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">
                      {Math.abs(stats.salesMetrics.growthRate).toFixed(1)}%
                    </span>
                  </>
                )}
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Active clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                In inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuotations}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stats.quotationStats.growth >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">
                      {stats.quotationStats.growth.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">
                      {Math.abs(stats.quotationStats.growth).toFixed(1)}%
                    </span>
                  </>
                )}
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quotation Statistics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quotation Statistics</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Quotations</CardTitle>
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.quotationStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Value: {formatCurrency(stats.quotationStats.pendingValue)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.quotationStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.quotationStats.completed / stats.totalQuotations) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.quotationStats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.quotationStats.rejected / stats.totalQuotations) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {stats.quotationStats.growth >= 0 ? '↑' : '↓'} {Math.abs(stats.quotationStats.growth).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Month over month</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to="/quotations" 
                  className="text-xs text-blue-600 hover:underline"
                >
                  View all quotations
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Quotation Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quotation Trends</CardTitle>
            <CardDescription>Number of quotations generated per month</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.quotationData}>
                <defs>
                  <linearGradient id="colorQuotations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="date" className="text-xs" tickLine={false} axisLine={false} />
                <YAxis className="text-xs" tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                              <span className="font-bold text-muted-foreground">{label}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Quotations</span>
                              <span className="font-bold text-indigo-600">{payload[0].value}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  fill="url(#colorQuotations)"
                  stroke="#6366F1"
                  strokeWidth={2}
                />
                <Bar 
                  dataKey="count" 
                  fill="#6366F1"
                  opacity={0.2}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>Latest quotations generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentQuotations && stats.recentQuotations.map((quotation) => (
                <div key={quotation.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                      ${quotation.status === 'COMPLETED' ? 'bg-green-100' : 
                        quotation.status === 'REJECTED' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                      <FileText className={`h-5 w-5 
                        ${quotation.status === 'COMPLETED' ? 'text-green-600' : 
                          quotation.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{quotation.ref}</p>
                      <p className="text-xs text-muted-foreground">{quotation.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(quotation.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(quotation.date)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link 
                to="/quotations" 
                className="text-sm text-blue-600 hover:underline"
              >
                View all quotations
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Tables Section */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Your revenue trend for the past {dateRange} days</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#818CF8" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="stroke-muted" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    className="text-xs" 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Date
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {label}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Revenue
                                </span>
                                <span className="font-bold text-indigo-600">
                                  ₹{payload[0].value.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    fill="url(#colorRevenue)"
                    stroke="#4F46E5"
                    strokeWidth={2}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#barGradient)"
                    opacity={0.2}
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest business transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentTransactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.clientName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'}`}>
                        {transaction.status}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Your best performing products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topProducts?.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.soldCount} units sold</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${(product.revenue / stats.topProducts[0].revenue) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium min-w-[100px] text-right">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}