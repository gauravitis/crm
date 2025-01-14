import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Users2,
  Package,
  FileText,
  ClipboardList,
  ShoppingCart,
  FileInput,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
}

export default function Sidebar({ isCollapsed, onCollapse, isMobile }: SidebarProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
    { name: 'Items', icon: Package, path: '/items' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Vendors', icon: Users, path: '/vendors' },
    { name: 'Employees', icon: Users2, path: '/employees' },
    { name: 'Quotations', icon: FileText, path: '/quotations' },
    { name: 'Quotation Generator', icon: FileInput, path: '/quotation-generator' },
    { name: 'Pending Orders', icon: ShoppingCart, path: '/pending-orders' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30
    flex flex-col
    bg-gray-800
    transition-transform duration-300 ease-in-out
    ${isCollapsed ? 'w-20' : 'w-64'}
    ${isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'}
    md:relative
  `;

  return (
    <>
      {/* Overlay */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => onCollapse(true)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex h-16 items-center justify-between px-4 bg-gray-900">
          {!isCollapsed && (
            <span className="text-white font-semibold text-lg">Menu</span>
          )}
          <button
            onClick={() => onCollapse(!isCollapsed)}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            {isMobile && !isCollapsed ? (
              <X className="h-6 w-6" />
            ) : (
              isCollapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-4 py-3
                      transition-colors duration-200
                      ${isCollapsed ? 'justify-center' : ''}
                      ${isActive 
                        ? 'text-white bg-gray-700' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }
                    `}
                  >
                    <item.icon className={`h-6 w-6 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}