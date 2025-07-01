'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

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
                className={`p-2 rounded flex items-center gap-2 transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-secondary/10 hover:text-primary'
                }`}
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