'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Moon, Sun, CaretDown } from '@phosphor-icons/react';
import ThemeToggle from '../common/ThemeToggle';

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Determine navigation context
  const isAdminRoute = pathname?.startsWith('/admin');
  const isQuizTaking = pathname?.includes('/quizzes/') && pathname?.includes('/take');
  const isAuthRoute = pathname?.startsWith('/auth');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render navigation for quiz taking
  if (isQuizTaking) return null;

  // Minimal navigation for auth pages
  if (isAuthRoute) {
    return (
      <header className="bg-card dark:bg-card-dark border-b border-border">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/ZestQuizLogo.webp"
                alt="ZestQuiz Logo"
                width={150}
                height={150}
                className="w-auto h-14"
                priority
              />
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-card dark:bg-card-dark border-b border-border transition-all duration-200">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo - adapts link based on context */}
          <Link 
            href={isAdminRoute ? '/admin/dashboard' : '/'} 
            className="flex items-center transition-transform hover:scale-105"
          >
            <Image
              src="/ZestQuizLogo.webp"
              alt="ZestQuiz Logo"
              width={150}
              height={150}
              className="w-auto h-14"
              priority
            />
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <UserMenu 
                user={user} 
                logout={logout} 
                isAdminRoute={isAdminRoute}
                isDropdownOpen={isDropdownOpen}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            ) : mounted ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg border border-border hover:bg-background dark:hover:bg-background-dark transition-all hidden sm:inline-block"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="w-32 h-10" /> // Placeholder to prevent layout shift
            )}
          </div>
        </div>

        {/* Mobile Navigation for Admin */}
        {isAdminRoute && user?.role === 'ADMIN' && mounted && (
          <div className="md:hidden mt-4 flex flex-wrap gap-2">
            <MobileNavLink href="/admin/dashboard" active={pathname === '/admin/dashboard'}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink href="/admin/quizzes" active={pathname.startsWith('/admin/quizzes') && !pathname.includes('/new')}>
              Quizzes
            </MobileNavLink>
            <MobileNavLink href="/admin/quizzes/new" active={pathname === '/admin/quizzes/new'}>
              Create
            </MobileNavLink>
          </div>
        )}
      </nav>
    </header>
  );
}

// Navigation Link Component
function NavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-primary/10 text-primary dark:text-primary-light' 
          : 'text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark'
      }`}
    >
      {children}
    </Link>
  );
}

// Mobile Navigation Link
function MobileNavLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
        active 
          ? 'bg-primary/10 text-primary dark:text-primary-light' 
          : 'text-text dark:text-text-dark bg-background dark:bg-background-dark'
      }`}
    >
      {children}
    </Link>
  );
}

// User Menu Component
function UserMenu({ user, logout, isAdminRoute, isDropdownOpen, setIsDropdownOpen }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsDropdownOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 focus:outline-none group"
      >
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary transition-colors text-black">
          <span className="text-lg font-medium text-black">
            {user.email[0].toUpperCase()}
          </span>
        </div>
        <span className="text-text dark:text-text-dark font-medium hidden sm:inline">
          {user.email.split('@')[0]}
        </span>
        <CaretDown 
          size={16} 
          weight="bold" 
          className={`text-text dark:text-text-dark transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown menu with animation */}
      <div className={`absolute right-0 mt-2 w-48 bg-card dark:bg-card-dark rounded-lg shadow-lg border border-border overflow-hidden transition-all duration-200 z-50 ${
        isDropdownOpen 
          ? 'opacity-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}>
        {!isAdminRoute && user.role === 'ADMIN' && (
          <Link
            href="/admin/dashboard"
            className="block px-4 py-2 text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            Admin Dashboard
          </Link>
        )}
        {isAdminRoute && (
          <Link
            href="/"
            className="block px-4 py-2 text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark transition-colors"
            onClick={() => setIsDropdownOpen(false)}
          >
            Back to Home
          </Link>
        )}
        <button
          onClick={() => {
            setIsDropdownOpen(false);
            logout();
          }}
          className="block w-full text-left px-4 py-2 text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark transition-colors border-t border-border"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 