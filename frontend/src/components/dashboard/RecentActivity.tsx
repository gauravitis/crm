import React from 'react';
import { Clock, FileText, Users, Package, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'quotation' | 'client' | 'item' | 'sale';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  amount?: number;
  user?: string;
}

interface RecentActivityProps {
  activities?: Activity[];
}

export default function RecentActivity({ activities = [] }: RecentActivityProps) {
  // Mock data if no activities provided
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'quotation',
      title: 'New Quotation Created',
      description: 'Quotation QUO-2024-001 created for ABC Pharmaceuticals',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'success',
      amount: 125000,
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'client',
      title: 'New Client Added',
      description: 'XYZ Research Labs added to client database',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'info',
      user: 'Jane Smith'
    },
    {
      id: '3',
      type: 'quotation',
      title: 'Quotation Approved',
      description: 'QUO-2024-002 approved by client - payment pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      status: 'success',
      amount: 89000,
      user: 'Mike Johnson'
    },
    {
      id: '4',
      type: 'item',
      title: 'Low Stock Alert',
      description: 'Chemical reagent XYZ-123 is running low (5 units left)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      status: 'warning',
      user: 'System'
    },
    {
      id: '5',
      type: 'quotation',
      title: 'Quotation Rejected',
      description: 'QUO-2024-003 rejected by client - price concerns',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      status: 'error',
      amount: 156000,
      user: 'Sarah Wilson'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const getActivityIcon = (type: Activity['type'], status: Activity['status']) => {
    const iconClass = "h-4 w-4";
    
    switch (type) {
      case 'quotation':
        return <FileText className={iconClass} />;
      case 'client':
        return <Users className={iconClass} />;
      case 'item':
        return <Package className={iconClass} />;
      case 'sale':
        return <CheckCircle className={iconClass} />;
      default:
        return <AlertCircle className={iconClass} />;
    }
  };

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'info':
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusBadge = (status: Activity['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'info':
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and system activities
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.slice(0, 5).map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${getStatusColor(activity.status)}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type, activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  {getStatusBadge(activity.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                    {activity.user && (
                      <>
                        <span>•</span>
                        <span>by {activity.user}</span>
                      </>
                    )}
                  </div>
                  {activity.amount && (
                    <span className="text-xs font-medium">
                      ₹{activity.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayActivities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activities will appear here as they happen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}