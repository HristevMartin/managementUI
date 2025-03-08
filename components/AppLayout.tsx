
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Header from './Header';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthPage, setIsAuthPage] = useState(false);

  useEffect(() => {
    // Check if current path is an auth page
    const pathname = window.location.pathname;
    setIsAuthPage(
      pathname.includes('/login') || 
      pathname.includes('/register') || 
      pathname.includes('/welcome-login')
    );
    
    // Close sidebar when clicking outside on mobile
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isSidebarOpen && 
        !target.closest('[data-sidebar]') && 
        !target.closest('[data-sidebar-trigger]')
      ) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  // Add/remove overflow-hidden to body when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && (
        <>
          {/* Mobile sidebar with fixed positioning */}
          <aside 
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
              isSidebarOpen ? "transform-none" : "-translate-x-full sm:translate-x-0"
            }`}
            data-sidebar
          >
            <Navbar toggleSidebar={() => setIsSidebarOpen(false)} />
          </aside>
        </>
      )}
      
      {/* Main content */}
      <main className={`min-h-screen transition-all duration-300 ease-in-out ${
        !isAuthPage ? "sm:pl-64" : ""
      }`}>
        {!isAuthPage && (
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                className="sm:hidden bg-white p-2 rounded-md hover:bg-gray-100"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                data-sidebar-trigger
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              
              <Header />
            </div>
          </header>
        )}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
