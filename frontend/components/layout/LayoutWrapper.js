'use client';

import { usePathname } from 'next/navigation';
import ClientLayout from './ClientLayout';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isQuizTakingRoute = pathname?.includes('/quizzes/') && pathname?.includes('/take');
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isQuizTakingRoute || isAdminRoute) {
    return children;
  }

  return (
    <ClientLayout>
      {children}
    </ClientLayout>
  );
} 