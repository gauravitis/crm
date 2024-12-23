import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onCollapse={setIsSidebarCollapsed}
        isMobile={isMobile}
      />
      
      <div className="flex flex-col flex-1 w-0">
        <Header onMenuClick={handleMenuClick} />
        <main 
          className={`
            flex-1 overflow-y-auto p-4
            transition-all duration-200 ease-in-out
            ${isSidebarCollapsed ? 'sm:ml-20' : 'sm:ml-64'}
          `}
        >
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
