'use client';

import { Inter } from "next/font/google";
import { Suspense, useEffect, useState } from "react";
import "./globals.css";
import Header from "./header/page";
import Navbar from "@/components/Navbar";
import { Menu } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

// Helper function to check if a path is an auth page
const isAuthPagePath = (pathname: string) => {
  const authPatterns = [
    '/login',
    '/register',
    '/welcome-login',
    '/forgot-password',
    '/reset-password'
  ];
  
  return authPatterns.some(pattern => pathname.includes(pattern));
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}) {
  // Get initial state from window location if available (client-side only)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize with null to indicate "not determined yet"
  const [isAuthPage, setIsAuthPage] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if current path is an auth page
    const pathname = window.location.pathname;
    const isOnAuthPage = isAuthPagePath(pathname);
    
    console.log("Current path:", pathname);
    console.log("Is auth page:", isOnAuthPage);
    
    setIsAuthPage(isOnAuthPage);

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

  // Don't render until we've determined if this is an auth page
  // This prevents the layout from shifting after initial render
  if (isAuthPage === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <div style={{maxWidth: '100vw', overflowX: 'hidden'}} className="min-h-screen bg-gray-50">
        {!isAuthPage && (
          <>
            {/* Mobile sidebar with fixed positioning */}
            <aside
              className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
                isSidebarOpen ? "transform-none" : "-translate-x-full sm:translate-x-0"
              }`}
              data-sidebar
            >
              <Navbar toggleSidebar={() => setIsSidebarOpen(false)} params={params} />
            </aside>
          </>
        )}

        {/* Main content - add transition for width changes */}
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
    </Suspense>
  );
}