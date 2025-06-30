'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  if (user && user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-primary">Admin Dashboard</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin/dashboard"
                className="block p-2 rounded hover:bg-secondary/10 text-gray-700 hover:text-primary"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/quizzes"
                className="block p-2 rounded hover:bg-secondary/10 text-gray-700 hover:text-primary"
              >
                Manage Quizzes
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/quizzes/new"
                className="block p-2 rounded hover:bg-secondary/10 text-gray-700 hover:text-primary"
              >
                Create Quiz
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 