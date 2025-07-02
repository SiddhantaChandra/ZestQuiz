'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import ThemeToggle from '../common/ThemeToggle';
import { CaretDown } from '@phosphor-icons/react';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <header className="bg-card dark:bg-card-dark border-b border-border">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/ZestQuizLogo.webp"
              alt="ZestQuiz Logo"
              width={150}
              height={150}
              className="w-auto h-14"
              priority
            />
          </Link>
          
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <span className="text-text dark:text-text-dark text-lg">
                      {user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="text-text dark:text-text-dark font-fredoka">
                    Hi, {user.email.split('@')[0]}
                  </span>
                  <CaretDown 
                    size={16} 
                    weight="bold" 
                    className={`text-text dark:text-text-dark transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card dark:bg-card-dark rounded-custom-md shadow-custom border border-border py-2 z-50">
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark transition-colors font-nunito"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark transition-colors font-nunito"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-custom-md border border-border bg-primary hover:bg-primary-hover transition-colors font-nunito text-white"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-custom-md border border-border bg-secondary hover:bg-secondary-hover transition-colors font-nunito text-text dark:text-text-dark"
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