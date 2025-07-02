'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card dark:bg-card-dark border-b border-border">
      <div className="flex justify-between items-center px-8 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Image
            src="/ZestQuizLogo.webp"
            alt="ZestQuiz Logo"
            width={150}
            height={150}
            className="w-auto h-14"
            priority
          />
        </Link>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary dark:bg-secondary-dark flex items-center justify-center border border-border font-medium text-gray-800 dark:text-gray-800">
              <span className="text-text-dark">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <span className="text-text dark:text-text-dark font-fredoka">
              Hi, {user?.email?.split('@')[0] || 'admin'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-custom-md border border-border bg-secondary hover:bg-secondary-hover text-text-dark transition-colors font-nunito font-semibold text-gray-800 dark:text-gray-800"
            >
              Home
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-custom-md border border-border bg-primary hover:bg-primary-hover transition-colors font-nunito font-semibold text-gray-800 dark:text-gray-800"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-custom-md border border-border bg-card hover:bg-background text-text dark:text-text-dark transition-colors font-nunito"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 