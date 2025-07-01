'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow-custom">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/ZestQuizLogo.webp"
              alt="ZestQuiz Logo"
              width={200}
              height={100}
              
            />
          </Link>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-black">
                      {user.email[0].toUpperCase()}
                    </div>
                    <span className="text-text font-fredoka">
                      Hi, {user.email.split('@')[0]}
                    </span>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="px-4 py-2 rounded-custom-md border border-black bg-white hover:bg-background transition-colors font-nunito"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-custom-md border border-black bg-primary text-white hover:bg-primary-hover transition-colors font-nunito"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-custom-md border border-black bg-primary hover:bg-primary-hover transition-colors font-nunito text-white"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-custom-md border border-black bg-secondary  hover:bg-secondary-hover transition-colors font-nunito text-black"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 