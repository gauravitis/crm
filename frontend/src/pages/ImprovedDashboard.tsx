import React, { useState } from 'react';
import { 
  Users, 
  Package, 
  IndianRupee, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCcw,
  Download,
  Filter,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "../components/ui/select";

// Import our new dashboard components
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import BusinessInsights from '../components/dashboard/BusinessInsights';

// Import existing hooks
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useCompanies } from '../hooks/useCompanies';

// Import chart components
import { 
  ComposedChart, 
  Line, 
  Area,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default function ImprovedDashboard() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');
  const [activeTab, setActiveTab] = useState('overview');

  const { companies } = useCompanies();
  const { stats, loading, error } = useDashboardStats(dateRange, comparisonPeriod);

  // Filter active companies
  const activeCompanies = companies?.filter(company => company.active !== false) || [];

  // Calculate additional metrics
  const additionalMetrics = React.useMemo(() => {
    if (!stats) return null;

    return {
      // Goal tracking
      monthlyGoal: 500000, // ₹5 Lakh
      goalProgress: (stats.totalRevenue / 500000) * 100,
      goalRemaining: Math.max(500000 - stats.totalRevenue, 0),
      
      // Performance indicators
      performanceScore: calculatePerformanceScore(stats),
      
      // Efficiency metrics
      avgDealSize: stats.totalQuotations > 0 ? stats.totalRevenue / stats.totalQuotations : 0,
      avgResponseTime: stats.conversionMetrics.avgResponseTime,
      
      // Risk indicators
      riskLevel: assessRiskLevel(stats),
      
      // Opportunities
      pendingOpportunity: stats.quotationStats.pendingValue,
      
      // Trends
      revenueVelocity: calculateRevenueVelocity(stats),
      conversionTrend: stats.conversionMetrics.quotationToSalesRate > 35 ? 'improving' : 'needs_attention'
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Dashboard Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Business Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
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
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="180">Last 6 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Compare With</label>
                <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previous">Previous Period</SelectItem>
                    <SelectItem value="year">Same Period Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Alerts */}
        {additionalMetrics?.riskLevel === 'high' && (
          <Alert className="border-l-4 border-l-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Attention Required</AlertTitle>
            <AlertDescription>
              Your conversion rate is below industry average. Consider reviewing your sales process.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card with Goal Progress */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                {stats.salesMetrics.growthRate >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={stats.salesMetrics.growthRate >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(stats.salesMetrics.growthRate).toFixed(1)}%
                </span>
                <span>vs last period</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Monthly Goal</span>
                  <span>{additionalMetrics?.goalProgress.toFixed(0)}%</span>
                </div>
                <Progress value={additionalMetrics?.goalProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(additionalMetrics?.goalRemaining || 0)} remaining
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.conversionMetrics.quotationToSalesRate.toFixed(1)}%
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Industry avg: 35%</span>
              </div>
              <Progress value={stats.conversionMetrics.quotationToSalesRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {stats.conversionMetrics.quotationToSalesRate > 35 ? 'Above' : 'Below'} industry average
              </p>
            </CardContent>
          </Card>

          {/* Average Deal Size */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(additionalMetrics?.avgDealSize || 0)}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>+12% vs last month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {stats.totalQuotations} quotations
              </p>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {additionalMetrics?.performanceScore}/100
              </div>
              <Progress value={additionalMetrics?.performanceScore} className="h-2 mb-2" />
              <Badge 
                className={
                  (additionalMetrics?.performanceScore || 0) > 80 ? 'bg-green-100 text-green-800' :
                  (additionalMetrics?.performanceScore || 0) > 60 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }
              >
                {(additionalMetrics?.performanceScore || 0) > 80 ? 'Excellent' :
                 (additionalMetrics?.performanceScore || 0) > 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Revenue over time with comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                        <Legend />
                        <Area 
                          dataKey="amount" 
                          fill="#3B82F6" 
                          stroke="#3B82F6" 
                          name="Current Period"
                          fillOpacity={0.3}
                        />
                        <Line 
                          dataKey="comparisonAmount" 
                          stroke="#F59E0B" 
                          strokeDasharray="5 5"
                          name="Previous Period"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quotation Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Quotation Pipeline</CardTitle>
                  <CardDescription>Status distribution with values</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.quotationStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {stats.quotationStatusDistribution.map((entry, index) => {
                            const colors = ['#F59E0B', '#10B981', '#EF4444'];
                            return <Cell key={`cell-${index}`} fill={colors[index]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Value']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <RecentActivity />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Performance</CardTitle>
                  <CardDescription>Average quotation value by company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <Bar
                        data={stats.avgQuoteValueByCompany}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="companyName" />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Avg Value']} />
                        <Bar dataKey="avgValue" fill="#3B82F6" />
                      </Bar>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quotation Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Quotation Trends</CardTitle>
                  <CardDescription>Number of quotations over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.quotationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#10B981" name="Current Period" />
                        <Line 
                          type="monotone" 
                          dataKey="comparisonCount" 
                          stroke="#F59E0B" 
                          name="Previous Period"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <BusinessInsights />
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <QuickActions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper functions
function calculatePerformanceScore(stats: any): number {
  const revenueScore = Math.min((stats.totalRevenue / 500000) * 30, 30);
  const conversionScore = Math.min(stats.conversionMetrics.quotationToSalesRate * 0.5, 25);
  const growthScore = Math.min(Math.abs(stats.salesMetrics.growthRate) * 0.3, 20);
  const efficiencyScore = Math.min((stats.totalQuotations / 50) * 25, 25);
  
  return Math.round(revenueScore + conversionScore + growthScore + efficiencyScore);
}

function assessRiskLevel(stats: any): 'low' | 'medium' | 'high' {
  let riskFactors = 0;
  
  if (stats.conversionMetrics.quotationToSalesRate < 30) riskFactors++;
  if (stats.salesMetrics.growthRate < 0) riskFactors++;
  if (stats.quotationStats.pending > stats.quotationStats.completed) riskFactors++;
  
  if (riskFactors >= 2) return 'high';
  if (riskFactors === 1) return 'medium';
  return 'low';
}

function calculateRevenueVelocity(stats: any): number {
  // Simple calculation - in real app, this would be more sophisticated
  return stats.totalRevenue / Math.max(stats.totalQuotations, 1);
}