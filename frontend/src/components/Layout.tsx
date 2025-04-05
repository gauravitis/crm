import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

// Save/load sidebar state to/from localStorage
const loadSidebarState = () => {
  try {
    const savedState = localStorage.getItem('sidebar_state');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('Error loading sidebar state:', error);
  }
  // Default values if nothing saved or error occurs
  return { collapsed: window.innerWidth < 1024, pinned: false };
};

const saveSidebarState = (state: { collapsed: boolean; pinned: boolean }) => {
  try {
    localStorage.setItem('sidebar_state', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving sidebar state:', error);
  }
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const initialState = loadSidebarState();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(initialState.collapsed);
  const [isSidebarPinned, setIsSidebarPinned] = useState(initialState.pinned);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a page that needs focus (more horizontal space)
  const needsFocus = ['/quotation-generator', '/quotations/new', '/quotations/edit'].some(
    path => location.pathname.includes(path)
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile
      if (mobile && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Save sidebar state to localStorage when changed
  useEffect(() => {
    saveSidebarState({ 
      collapsed: isSidebarCollapsed, 
      pinned: isSidebarPinned 
    });
  }, [isSidebarCollapsed, isSidebarPinned]);

  const handleMenuClick = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleSidebarPinChange = (pinned: boolean) => {
    setIsSidebarPinned(pinned);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onCollapse={setIsSidebarCollapsed}
        isMobile={isMobile}
        isPinned={isSidebarPinned}
        onPinChange={handleSidebarPinChange}
      />
      
      <div className="flex flex-col flex-1 w-0">
        <Header onMenuClick={handleMenuClick} />
        <main 
          className={`
            flex-1 overflow-y-auto p-3 sm:p-4 md:p-6
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? 'sm:ml-16' : 'sm:ml-64'}
            ${needsFocus ? 'max-w-full' : ''}
          `}
        >
          <div className={`mx-auto ${needsFocus ? 'w-full' : 'container'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
