'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  if (user && user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <AdminHeader />
      <div className="flex flex-1 bg-gray-100">
        <Sidebar />
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 