import React, { useEffect } from 'react';
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
  Pin,
  PinOff
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  isMobile: boolean;
  isPinned: boolean;
  onPinChange: (pinned: boolean) => void;
}

export default function Sidebar({ isCollapsed, onCollapse, isMobile, isPinned, onPinChange }: SidebarProps) {
  const location = useLocation();

  // Define routes that should have the sidebar auto-collapsed
  const wideContentPages = ['/quotation-generator', '/quotations/new', '/quotations/edit'];

  // Auto-collapse sidebar on wide content pages if not pinned
  useEffect(() => {
    if (!isPinned && wideContentPages.some(path => location.pathname.includes(path))) {
      onCollapse(true); // Collapse sidebar
    }
  }, [location.pathname, isPinned, onCollapse]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
    { name: 'Items', icon: Package, path: '/items' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Vendors', icon: Users, path: '/vendors' },
    { name: 'Employees', icon: Users2, path: '/employees' },
    { name: 'Companies', icon: FileText, path: '/companies' },
    { name: 'Quotations', icon: FileText, path: '/quotations' },
    { name: 'Quotation Generator', icon: FileInput, path: '/quotation-generator' },
    { name: 'Pending Orders', icon: ShoppingCart, path: '/pending-orders' },
    { name: 'Sales', icon: ShoppingCart, path: '/sales' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30
    flex flex-col
    bg-gray-800
    transition-all duration-300 ease-in-out
    ${isCollapsed ? 'w-16' : 'w-64'} 
    ${isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0'}
    shadow-lg
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
        <div className="flex h-16 items-center justify-between px-3 bg-gray-900">
          {!isCollapsed ? (
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">Menu</span>
              <button 
                onClick={() => onPinChange(!isPinned)}
                className="p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <Pin className="h-4 w-4" />
                ) : (
                  <PinOff className="h-4 w-4" />
                )}
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <button 
                onClick={() => onPinChange(!isPinned)}
                className="p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <Pin className="h-4 w-4" />
                ) : (
                  <PinOff className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
          <button
            onClick={() => onCollapse(!isCollapsed)}
            className="p-1.5 rounded-md bg-gray-700 text-gray-300 hover:text-white focus:outline-none focus:ring-1 focus:ring-gray-500"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobile && !isCollapsed ? (
              <X className="h-5 w-5" />
            ) : (
              isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <li key={item.path} title={isCollapsed ? item.name : undefined}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2.5 mx-2 my-1 rounded-md
                      transition-colors duration-200
                      ${isCollapsed ? 'justify-center' : ''}
                      ${isActive 
                        ? 'text-white bg-blue-600 shadow-md' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }
                    `}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && (
                      <span className="text-sm truncate">{item.name}</span>
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