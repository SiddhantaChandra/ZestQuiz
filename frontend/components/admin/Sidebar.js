'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      // For dashboard, only match exact path
      return pathname === path ? 'bg-purple-100 text-purple-900' : 'text-gray-600 hover:bg-gray-50';
    } else if (path === '/admin/quizzes/new') {
      // For create quiz, only match exact path
      return pathname === path ? 'bg-purple-100 text-purple-900' : 'text-gray-600 hover:bg-gray-50';
    } else if (path === '/admin/quizzes') {
      // For manage quizzes, match the path but exclude /new and other subpaths
      return pathname.startsWith(path) && pathname.split('/').length === 3 
        ? 'bg-purple-100 text-purple-900' 
        : 'text-gray-600 hover:bg-gray-50';
    }
    return 'text-gray-600 hover:bg-gray-50';
  };

  const navItems = [
    {
      href: '/admin/dashboard',
      icon: '/icons/dashboard/dashboard-icon.webp',
      label: 'Dashboard'
    },
    {
      href: '/admin/quizzes',
      icon: '/icons/dashboard/manage-quiz-icon.webp',
      label: 'Manage Quizzes'
    },
    {
      href: '/admin/quizzes/new',
      icon: '/icons/dashboard/create-quiz-icon.webp',
      label: 'Create Quiz'
    }
  ];

  return (
    <aside 
      className={`bg-white shadow-md transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className={`text-xl font-bold text-primary transition-opacity duration-300 ${
          isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
        }`}>
          Dashboard
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <Image 
            src={isCollapsed ? '/icons/dashboard/expand-icon.webp' : '/icons/dashboard/collapse-icon.webp'} 
            alt={isCollapsed ? 'Expand' : 'Collapse'} 
            width={28} 
            height={28}
          />
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`p-2 rounded flex items-center gap-2 transition-all duration-200 ${isActive(item.href)}`}
              >
                <Image src={item.icon} alt={item.label} width={28} height={28} />
                <span className={`transition-opacity duration-300 ${
                  isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
                }`}>
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
} 