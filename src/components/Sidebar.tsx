import React from 'react';
import { LayoutDashboard, Users, FileText, DollarSign, Settings, Package, ClipboardList, Truck, FileOutput, ClipboardCheck, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Items', href: '/items', icon: Package },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Quotation Generator', href: '/quotation-generator', icon: FileOutput },
  { name: 'Pending Orders', href: '/pending-orders', icon: ClipboardCheck },
  { name: 'Sales', href: '/sales', icon: DollarSign },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isCollapsed = false, onCollapse }: SidebarProps) {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const handleCollapse = () => {
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-10"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative inset-y-0 left-0 bg-gray-900 text-white 
          transform transition-all duration-200 ease-in-out z-20
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center justify-between p-4 ${isCollapsed ? 'px-2' : ''}`}>
            {!isCollapsed && <h1 className="text-2xl font-bold">CRM Pro</h1>}
            <button
              onClick={handleCollapse}
              className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isCollapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className={`flex-1 space-y-1 px-2 py-4 overflow-y-auto ${isCollapsed ? 'px-1' : ''}`}>
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
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}