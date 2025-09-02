import React from 'react';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Lightbulb, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'achievement' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  metrics?: {
    current: number;
    target: number;
    unit: string;
  };
}

interface BusinessInsightsProps {
  insights?: Insight[];
}

export default function BusinessInsights({ insights = [] }: BusinessInsightsProps) {
  // Mock insights if none provided
  const mockInsights: Insight[] = [
    {
      id: '1',
      type: 'opportunity',
      title: 'Increase Follow-up Frequency',
      description: 'Clients who receive follow-ups within 24 hours are 40% more likely to convert. You have 12 pending quotations that could benefit from immediate follow-up.',
      impact: 'high',
      confidence: 85,
      actionable: true,
      metrics: {
        current: 2.5,
        target: 1,
        unit: 'days avg response time'
      }
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Conversion Rate Improvement',
      description: 'Your conversion rate has improved by 15% this month compared to last month. This is above industry average of 35%.',
      impact: 'high',
      confidence: 95,
      actionable: false,
      metrics: {
        current: 42,
        target: 35,
        unit: '% conversion rate'
      }
    },
    {
      id: '3',
      type: 'risk',
      title: 'Seasonal Revenue Dip Expected',
      description: 'Based on historical data, revenue typically drops 20% in the next quarter. Consider increasing marketing efforts or offering seasonal promotions.',
      impact: 'medium',
      confidence: 78,
      actionable: true
    },
    {
      id: '4',
      type: 'recommendation',
      title: 'Focus on High-Value Clients',
      description: 'Chembio Lifesciences generates 60% more revenue per quotation than other companies. Consider allocating more resources to similar clients.',
      impact: 'medium',
      confidence: 88,
      actionable: true,
      metrics: {
        current: 125000,
        target: 200000,
        unit: '₹ avg deal size'
      }
    },
    {
      id: '5',
      type: 'opportunity',
      title: 'Inventory Optimization',
      description: 'You have ₹2.5L worth of slow-moving inventory. Consider bundling these items with popular products or offering discounts.',
      impact: 'medium',
      confidence: 72,
      actionable: true
    }
  ];

  const displayInsights = insights.length > 0 ? insights : mockInsights;

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'achievement':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-l-green-500 bg-green-50';
      case 'risk':
        return 'border-l-red-500 bg-red-50';
      case 'achievement':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'recommendation':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Business Insights
        </CardTitle>
        <CardDescription>
          AI-powered insights and recommendations for your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border-l-4 ${getTypeColor(insight.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact} impact
                      </Badge>
                      {insight.actionable && (
                        <Badge variant="outline">Actionable</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    
                    {insight.metrics && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">
                            Current: {insight.metrics.current} {insight.metrics.unit}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Target: {insight.metrics.target} {insight.metrics.unit}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((insight.metrics.current / insight.metrics.target) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence: {insight.confidence}%
                        </span>
                        <Progress value={insight.confidence} className="w-16 h-1" />
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayInsights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available</p>
            <p className="text-sm">Insights will be generated as more data becomes available</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Insights updated 5 minutes ago
            </p>
            <Button variant="ghost" size="sm">
              View All Insights
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}