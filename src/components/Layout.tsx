import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} onCollapse={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-200 ease-in-out ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} lg:ml-0`}>
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
