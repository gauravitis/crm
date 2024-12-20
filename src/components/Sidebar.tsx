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
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 w-64 bg-gray-900 text-white 
          transform transition-transform duration-200 ease-in-out z-20
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold">CRM Pro</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
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
      </div>
    </>
  );
}