import React from 'react';
import { LayoutDashboard, Users, FileText, DollarSign, Settings, Package, ClipboardList, Truck, Receipt, FileOutput } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Quotation Generator', href: '/quotation-generator', icon: FileOutput },
  { name: 'Sales', href: '/sales', icon: DollarSign },
  { name: 'Sales Invoices', href: '/sales-invoices', icon: Receipt },
  { name: 'Purchase Invoices', href: '/purchase-invoices', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white h-screen fixed">
      <div className="p-4">
        <h1 className="text-2xl font-bold">CRM Pro</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}