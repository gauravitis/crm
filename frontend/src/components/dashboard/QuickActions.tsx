import React from 'react';
import { Plus, FileText, Users, Package, TrendingUp, Calendar, Bell, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  color: string;
}

export default function QuickActions() {
  const quickActions: QuickAction[] = [
    {
      id: 'new-quotation',
      title: 'New Quotation',
      description: 'Create a new quotation for a client',
      icon: <FileText className="h-5 w-5" />,
      href: '/quotation-generator',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'add-client',
      title: 'Add Client',
      description: 'Register a new client',
      icon: <Users className="h-5 w-5" />,
      href: '/clients',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'add-item',
      title: 'Add Item',
      description: 'Add new product to inventory',
      icon: <Package className="h-5 w-5" />,
      href: '/items',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      description: 'View detailed business analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/analytics',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Schedule client meetings',
      icon: <Calendar className="h-5 w-5" />,
      href: '/calendar',
      badge: 'Coming Soon',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View pending notifications',
      icon: <Bell className="h-5 w-5" />,
      href: '/notifications',
      badge: '3',
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used actions for faster workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.id} to={action.href}>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all duration-200 w-full"
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg text-white ${action.color}`}>
                    {action.icon}
                  </div>
                  {action.badge && (
                    <Badge variant={action.badge === 'Coming Soon' ? 'secondary' : 'default'}>
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}