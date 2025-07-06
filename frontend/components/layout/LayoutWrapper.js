'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from '../admin/Sidebar';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isQuizTaking = pathname?.includes('/quizzes/') && pathname?.includes('/take');
  const isAdminRoute = pathname?.startsWith('/admin');
  const showFooter = !isAdminRoute && !isQuizTaking;
  const showSidebar = isAdminRoute;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isQuizTaking) {
    return <>{children}</>;
  }

  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="h-16 bg-card dark:bg-card-dark border-b border-border" />
        <div className="flex flex-1">
          {isAdminRoute && <div className="w-64 bg-card dark:bg-card-dark border-r border-border" />}
          <main className="flex-1">
            <div className={isAdminRoute ? 'p-6' : 'container mx-auto px-4 py-6'}>
              {children}
            </div>
          </main>
        </div>
        {showFooter && <div className="h-16 bg-card dark:bg-card-dark border-t border-border" />}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />
      
      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Admin Sidebar */}
        {showSidebar && <Sidebar />}
        
        {/* Page Content */}
        <main className="flex-1">
          <div className={showSidebar ? 'p-6' : 'container mx-auto px-4 py-6'}>
      {children}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
} 