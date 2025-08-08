import React, { useState, useEffect } from 'react';
import { Users, Package, IndianRupee, Loader, TrendingUp, AlertCircle, Calendar, ArrowUpRight, ArrowDownRight, FileText, PieChart, RefreshCcw } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useCompanies } from '../hooks/useCompanies';
import { Link } from 'react-router-dom';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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

// Company interface
interface Company {
  id: string;
  name: string;
  active?: boolean;
  [key: string]: any;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('30'); // days
  const { companies } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous'); // 'previous', 'year'
  
  // Pass parameters to the dashboard stats hook
  const { stats, loading, error } = useDashboardStats(dateRange, comparisonPeriod);
  
  // Filter active companies
  const activeCompanies = (companies?.filter(company => company.active !== false) || []) as Company[];
  
  // Filter stats based on selected company
  const filteredStats = React.useMemo(() => {
    if (selectedCompanyId === 'all') {
      return stats;
    }
    
    // Deep clone the stats object to avoid mutating the original
    const filtered = JSON.parse(JSON.stringify(stats));
    
    // Filter company-specific metrics
    if (filtered.avgQuoteValueByCompany) {
      filtered.avgQuoteValueByCompany = filtered.avgQuoteValueByCompany.filter(
        (company: { companyId: string }) => company.companyId === selectedCompanyId
      );
    }
    
    // Filter only the quotations for the selected company
    if (filtered.recentQuotations) {
      // We're assuming recentQuotations needs to be extended with companyId
      // This is just for type safety in the filtering function
      filtered.recentQuotations = stats.recentQuotations
        .filter((quotation: any) => quotation.companyId === selectedCompanyId);
    }
    
    return filtered;
  }, [stats, selectedCompanyId]);

  // Use filteredStats instead of stats when rendering
  const displayStats = filteredStats || stats;

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
        <div className="flex flex-col space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <Button 
              onClick={() => window.location.reload()}
              size="sm"
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          {/* Filters Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            {/* Company Filter */}
            <div className="w-full sm:w-auto">
              <label htmlFor="company-filter" className="block text-sm font-medium mb-1">Company</label>
              <Select
                value={selectedCompanyId}
                onValueChange={(value) => setSelectedCompanyId(value)}
              >
                <SelectTrigger className="w-full sm:w-[200px]" id="company-filter">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {activeCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Time Range and Comparison Period */}
            <div className="w-full sm:w-auto space-y-2">
              <div>
                <label htmlFor="time-range" className="block text-sm font-medium mb-1">Time Period</label>
                <select 
                  id="time-range"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background w-full sm:w-[200px]"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="comparison-period" className="block text-sm font-medium mb-1">Compare With</label>
                <select 
                  id="comparison-period"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background w-full sm:w-[200px]"
                  value={comparisonPeriod}
                  onChange={(e) => setComparisonPeriod(e.target.value)}
                >
                  <option value="previous">Previous Period</option>
                  <option value="year">Same Period Last Year</option>
                </select>
              </div>
            </div>
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
              <div className="text-2xl font-bold">{formatCurrency(displayStats.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {displayStats.salesMetrics.growthRate >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">
                      {displayStats.salesMetrics.growthRate.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">
                      {Math.abs(displayStats.salesMetrics.growthRate).toFixed(1)}%
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
              <div className="text-2xl font-bold">{displayStats.totalClients}</div>
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
              <div className="text-2xl font-bold">{displayStats.totalItems}</div>
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
              <div className="text-2xl font-bold">{displayStats.totalQuotations}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {displayStats.quotationStats.growth >= 0 ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">
                      {displayStats.quotationStats.growth.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">
                      {Math.abs(displayStats.quotationStats.growth).toFixed(1)}%
                    </span>
                  </>
                )}
                <span>from last month</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Comparison Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Metrics Comparison</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Revenue Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Revenue Comparison</CardTitle>
                <CardDescription>
                  {comparisonPeriod === 'previous' ? 'Current vs. Previous Period' : 'Current vs. Last Year'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold">{formatCurrency(displayStats.totalRevenue || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      {comparisonPeriod === 'previous' ? 'Previous' : 'Last Year'}
                    </p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {formatCurrency(displayStats.comparisonData.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${displayStats.comparisonData.growth >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(displayStats.comparisonData.growth), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={displayStats.comparisonData.growth >= 0 ? "text-green-600" : "text-red-600"}>
                    {displayStats.comparisonData.growth >= 0 ? "+" : ""}
                    {displayStats.comparisonData.growth.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">
                    vs. {comparisonPeriod === 'previous' ? 'previous' : 'last year'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Quotation Comparison</CardTitle>
                <CardDescription>
                  {comparisonPeriod === 'previous' ? 'Current vs. Previous Period' : 'Current vs. Last Year'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current</p>
                    <p className="text-2xl font-bold">{displayStats.totalQuotations}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      {comparisonPeriod === 'previous' ? 'Previous' : 'Last Year'}
                    </p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {Math.round(displayStats.totalQuotations / (1 + displayStats.quotationStats.growth / 100)) || 0}
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full ${displayStats.quotationStats.growth >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(displayStats.quotationStats.growth), 100)}%` }}
                  />
                </div>
                <p className="text-sm text-center">
                  <span className={displayStats.quotationStats.growth >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {displayStats.quotationStats.growth >= 0 ? '↑' : '↓'} 
                    {Math.abs(displayStats.quotationStats.growth).toFixed(1)}%
                  </span> 
                  {comparisonPeriod === 'previous' ? ' from previous period' : ' compared to last year'}
                </p>
              </CardContent>
            </Card>

            {/* Conversion Rate Comparison */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conversion Rate Analysis</CardTitle>
                <CardDescription>
                  Quotation to sales conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Rate</p>
                    <p className="text-2xl font-bold">{displayStats.conversionMetrics.quotationToSalesRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold text-muted-foreground">50.0%</p>
                  </div>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ width: `${displayStats.conversionMetrics.quotationToSalesRate * 2}%` }}
                  />
                </div>
                <p className="text-sm text-center">
                  {displayStats.conversionMetrics.quotationToSalesRate < 50 
                    ? `${(50 - displayStats.conversionMetrics.quotationToSalesRate).toFixed(1)}% below target` 
                    : `${(displayStats.conversionMetrics.quotationToSalesRate - 50).toFixed(1)}% above target`}
                </p>
              </CardContent>
            </Card>
          </div>
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
                <div className="text-2xl font-bold">{displayStats.quotationStats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Value: {formatCurrency(displayStats.quotationStats.pendingValue)}
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
                <div className="text-2xl font-bold">{displayStats.quotationStats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  {((displayStats.quotationStats.completed / displayStats.totalQuotations) * 100).toFixed(1)}% of total
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
                <div className="text-2xl font-bold">{displayStats.quotationStats.rejected}</div>
                <p className="text-xs text-muted-foreground">
                  {((displayStats.quotationStats.rejected / displayStats.totalQuotations) * 100).toFixed(1)}% of total
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
                  {displayStats.quotationStats.growth >= 0 ? '↑' : '↓'} {Math.abs(displayStats.quotationStats.growth).toFixed(1)}%
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

        {/* Enhanced Metrics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Enhanced Analytics</h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Quotation Status Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Quotation Status Distribution</CardTitle>
                <CardDescription>Overview of quotation statuses</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={displayStats.quotationStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {displayStats.quotationStatusDistribution.map((entry: any, index: number) => {
                        const COLORS = ['#FFB347', '#4BC0C0', '#FF6B6B']; // Orange, Teal, Red
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Legend />
                    <Tooltip
                      formatter={(value, name, props) => [`${value} quotations`, props.payload.status]}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Metrics */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Conversion Metrics</CardTitle>
                <CardDescription>Performance indicators for sales process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quotation to Sales Rate</span>
                      <span className="text-sm text-muted-foreground">{displayStats.conversionMetrics.quotationToSalesRate.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${displayStats.conversionMetrics.quotationToSalesRate}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Percentage of quotations that converted to completed sales
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Response Time</span>
                      <span className="text-sm text-muted-foreground">{displayStats.conversionMetrics.avgResponseTime} days</span>
                    </div>
                    <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(displayStats.conversionMetrics.avgResponseTime / 5 * 100, 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Average time from quotation to client decision
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending Quotation Value</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(displayStats.quotationStats.pendingValue)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Total value of pending quotations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Performance */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Company Quotation Values</CardTitle>
                <CardDescription>Average quotation value by company</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayStats.avgQuoteValueByCompany.length > 0 ? (
                    displayStats.avgQuoteValueByCompany.map((company: any, index: number) => (
                      <div key={company.companyId || index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-sm">{company.companyName}</span>
                          <span className="text-sm">{formatCurrency(company.avgValue)}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary"
                            style={{ 
                              width: `${(company.avgValue / (displayStats.avgQuoteValueByCompany[0]?.avgValue || 1)) * 100}%` 
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {company.count} quotations
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No company data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quotation Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quotations Over Time</h2>
          <Card>
            <CardHeader>
              <CardTitle>Quotation Trends</CardTitle>
              <CardDescription>Number of quotations over time with comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={displayStats.quotationData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Quotations']} />
                    <Bar dataKey="count" name="Current Period" barSize={20} fill="#65A4FC" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="comparisonCount" strokeWidth={2} name={comparisonPeriod === 'previous' ? 'Previous Period' : 'Last Year'} stroke="#F97316" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Revenue Trends</h2>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analysis</CardTitle>
              <CardDescription>Revenue over time with comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={displayStats.revenueData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Bar dataKey="amount" name="Current Period" barSize={20} fill="#22C55E" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="comparisonAmount" strokeWidth={2} name={comparisonPeriod === 'previous' ? 'Previous Period' : 'Last Year'} stroke="#F97316" dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Quotations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
            <CardDescription>Latest quotations generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayStats.recentQuotations && displayStats.recentQuotations.map((quotation: any) => (
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
                <ComposedChart data={displayStats.revenueData}>
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
                {displayStats.recentTransactions?.map((transaction: any) => (
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
                {displayStats.topProducts?.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.soldCount} units sold</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${(product.revenue / displayStats.topProducts[0].revenue) * 100}%` }}
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