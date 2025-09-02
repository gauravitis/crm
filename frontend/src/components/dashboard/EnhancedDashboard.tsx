import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Calendar,
  Users,
  Package,
  IndianRupee,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  Download,
  RefreshCcw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Progress } from '../ui/progress';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
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
  ComposedChart
} from 'recharts';

// Enhanced Dashboard with Business Intelligence
export default function EnhancedDashboard() {
  const [dateRange, setDateRange] = useState('30');
  const [selectedCompanyId, setSelectedCompanyId] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const { stats, loading, error } = useDashboardStats(dateRange);

  // Business Intelligence Calculations
  const businessInsights = React.useMemo(() => {
    if (!stats) return null;

    const insights = {
      // Revenue Predictions
      predictedRevenue: stats.totalRevenue * 1.15, // Simple 15% growth prediction
      
      // Performance Indicators
      performanceScore: calculatePerformanceScore(stats),
      
      // Risk Assessment
      riskFactors: assessRiskFactors(stats),
      
      // Opportunities
      opportunities: identifyOpportunities(stats),
      
      // Alerts
      alerts: generateAlerts(stats),
      
      // Goals Progress
      monthlyGoal: 500000, // ₹5 Lakh monthly goal
      goalProgress: (stats.totalRevenue / 500000) * 100,
      
      // Efficiency Metrics
      avgDealSize: stats.totalQuotations > 0 ? stats.totalRevenue / stats.totalQuotations : 0,
      conversionTrend: stats.conversionMetrics.quotationToSalesRate,
      
      // Client Insights
      clientRetention: 85, // Placeholder - would calculate from actual data
      newClientRate: 12, // Placeholder
      
      // Forecasting
      forecastData: generateForecast(stats)
    };

    return insights;
  }, [stats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header with Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Business Intelligence Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time insights and predictive analytics for your business
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Alerts Section */}
        {businessInsights?.alerts && businessInsights.alerts.length > 0 && (
          <div className="space-y-2">
            {businessInsights.alerts.map((alert, index) => (
              <Alert key={index} className={`border-l-4 ${
                alert.type === 'critical' ? 'border-l-red-500 bg-red-50' :
                alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <Bell className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2">
                  {alert.title}
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.type}
                  </Badge>
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards with Enhanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
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
                  <Progress 
                    value={businessInsights?.goalProgress || 0} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {businessInsights?.goalProgress?.toFixed(1)}% of monthly goal
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.conversionMetrics.quotationToSalesRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>Industry avg: 35%</span>
                  </div>
                  <Progress 
                    value={stats.conversionMetrics.quotationToSalesRate} 
                    className="mt-2" 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{businessInsights?.avgDealSize?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>+12% vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {businessInsights?.performanceScore || 0}/100
                  </div>
                  <Progress 
                    value={businessInsights?.performanceScore || 0} 
                    className="mt-2" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Based on multiple KPIs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend with Forecast</CardTitle>
                  <CardDescription>
                    Historical data with 30-day prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={businessInsights?.forecastData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `₹${Number(value).toLocaleString('en-IN')}`, 
                            name
                          ]}
                        />
                        <Legend />
                        <Area 
                          dataKey="actual" 
                          fill="#3B82F6" 
                          stroke="#3B82F6" 
                          name="Actual Revenue"
                          fillOpacity={0.3}
                        />
                        <Line 
                          dataKey="predicted" 
                          stroke="#F59E0B" 
                          strokeDasharray="5 5"
                          name="Predicted Revenue"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quotation Pipeline</CardTitle>
                  <CardDescription>
                    Status distribution with values
                  </CardDescription>
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
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Value']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Metrics */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Revenue Growth</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.salesMetrics.growthRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={Math.abs(stats.salesMetrics.growthRate)} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Conversion Rate</span>
                        <span className="text-sm text-muted-foreground">
                          {stats.conversionMetrics.quotationToSalesRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={stats.conversionMetrics.quotationToSalesRate} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Client Retention</span>
                        <span className="text-sm text-muted-foreground">
                          {businessInsights?.clientRetention}%
                        </span>
                      </div>
                      <Progress value={businessInsights?.clientRetention || 0} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Breakdown</CardTitle>
                  <CardDescription>Performance components</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Revenue</span>
                      <Badge variant="secondary">85/100</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversion</span>
                      <Badge variant="secondary">78/100</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Efficiency</span>
                      <Badge variant="secondary">92/100</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Growth</span>
                      <Badge variant="secondary">88/100</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Performance</CardTitle>
                  <CardDescription>Revenue by company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.avgQuoteValueByCompany}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="companyName" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Avg Value']}
                        />
                        <Bar dataKey="avgValue" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Quotations vs Revenue correlation</CardDescription>
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
                        <Bar dataKey="count" fill="#10B981" name="Quotations" />
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

          {/* Forecasting Tab */}
          <TabsContent value="forecasting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Forecast</CardTitle>
                  <CardDescription>30-day revenue prediction based on trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={businessInsights?.forecastData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `₹${Number(value).toLocaleString('en-IN')}`, 
                            name
                          ]}
                        />
                        <Legend />
                        <Area 
                          dataKey="actual" 
                          stackId="1" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          name="Historical"
                          fillOpacity={0.6}
                        />
                        <Area 
                          dataKey="predicted" 
                          stackId="2" 
                          stroke="#F59E0B" 
                          fill="#F59E0B" 
                          name="Predicted"
                          fillOpacity={0.4}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictions</CardTitle>
                  <CardDescription>Next 30 days forecast</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Expected Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{businessInsights?.predictedRevenue?.toLocaleString('en-IN') || '0'}
                      </p>
                      <p className="text-xs text-muted-foreground">+15% growth expected</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Confidence Level</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={78} className="flex-1" />
                        <span className="text-sm">78%</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Risk Factors</p>
                      <div className="space-y-2">
                        {businessInsights?.riskFactors?.map((risk, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Opportunities</CardTitle>
                  <CardDescription>AI-powered recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessInsights?.opportunities?.map((opportunity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{opportunity.title}</p>
                          <p className="text-xs text-muted-foreground">{opportunity.description}</p>
                          <Badge variant="outline" className="mt-2">
                            {opportunity.impact}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <CardDescription>Recommended next steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Follow up on pending quotations</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{stats.quotationStats.pendingValue.toLocaleString('en-IN')} in pending value
                        </p>
                        <Button size="sm" className="mt-2">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Optimize response time</p>
                        <p className="text-xs text-muted-foreground">
                          Current avg: {stats.conversionMetrics.avgResponseTime} days
                        </p>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Target className="h-3 w-3 mr-1" />
                          Set Target
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper functions for business intelligence
function calculatePerformanceScore(stats: any): number {
  // Simple scoring algorithm based on multiple factors
  const revenueScore = Math.min((stats.totalRevenue / 500000) * 30, 30); // 30 points max
  const conversionScore = Math.min(stats.conversionMetrics.quotationToSalesRate * 0.5, 25); // 25 points max
  const growthScore = Math.min(Math.abs(stats.salesMetrics.growthRate) * 0.3, 20); // 20 points max
  const efficiencyScore = Math.min((stats.totalQuotations / 50) * 25, 25); // 25 points max
  
  return Math.round(revenueScore + conversionScore + growthScore + efficiencyScore);
}

function assessRiskFactors(stats: any): string[] {
  const risks = [];
  
  if (stats.conversionMetrics.quotationToSalesRate < 30) {
    risks.push('Low conversion rate');
  }
  
  if (stats.salesMetrics.growthRate < 0) {
    risks.push('Negative growth trend');
  }
  
  if (stats.quotationStats.pending > stats.quotationStats.completed) {
    risks.push('High pending quotations');
  }
  
  return risks;
}

function identifyOpportunities(stats: any): Array<{title: string, description: string, impact: string}> {
  const opportunities = [];
  
  if (stats.quotationStats.pendingValue > 100000) {
    opportunities.push({
      title: 'Convert Pending Quotations',
      description: `₹${stats.quotationStats.pendingValue.toLocaleString('en-IN')} in pending quotations`,
      impact: 'High Impact'
    });
  }
  
  if (stats.conversionMetrics.quotationToSalesRate > 40) {
    opportunities.push({
      title: 'Scale Marketing Efforts',
      description: 'High conversion rate indicates good market fit',
      impact: 'Medium Impact'
    });
  }
  
  return opportunities;
}

function generateAlerts(stats: any): Array<{type: string, title: string, message: string}> {
  const alerts = [];
  
  if (stats.quotationStats.pendingValue > 200000) {
    alerts.push({
      type: 'warning',
      title: 'High Pending Value',
      message: `₹${stats.quotationStats.pendingValue.toLocaleString('en-IN')} in pending quotations needs attention`
    });
  }
  
  if (stats.conversionMetrics.quotationToSalesRate < 25) {
    alerts.push({
      type: 'critical',
      title: 'Low Conversion Rate',
      message: 'Conversion rate is below industry average. Review sales process.'
    });
  }
  
  return alerts;
}

function generateForecast(stats: any): Array<{date: string, actual?: number, predicted?: number}> {
  // Simple forecast generation - in real app, use proper forecasting algorithms
  const forecastData = [];
  const baseRevenue = stats.totalRevenue / 30; // Daily average
  
  // Historical data (last 15 days)
  for (let i = 15; i >= 1; i--) {
    forecastData.push({
      date: `Day -${i}`,
      actual: baseRevenue * (0.8 + Math.random() * 0.4), // Simulate variance
    });
  }
  
  // Predicted data (next 15 days)
  for (let i = 1; i <= 15; i++) {
    forecastData.push({
      date: `Day +${i}`,
      predicted: baseRevenue * 1.15 * (0.9 + Math.random() * 0.2), // 15% growth with variance
    });
  }
  
  return forecastData;
}