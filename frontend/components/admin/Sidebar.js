'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartLineUp, 
  ListChecks, 
  PlusCircle,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      // For dashboard, only match exact path
      return pathname === path ? 'bg-primary/10 text-primary dark:text-primary-light' : 'text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark';
    } else if (path === '/admin/quizzes/new') {
      // For create quiz, only match exact path
      return pathname === path ? 'bg-primary/10 text-primary dark:text-primary-light' : 'text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark';
    } else if (path === '/admin/quizzes') {
      // For manage quizzes, match the path but exclude /new and other subpaths
      return pathname.startsWith(path) && pathname.split('/').length === 3 
        ? 'bg-primary/10 text-primary dark:text-primary-light' 
        : 'text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark';
    }
    return 'text-text dark:text-text-dark hover:bg-background dark:hover:bg-background-dark';
  };

  const navItems = [
    {
      href: '/admin/dashboard',
      icon: ChartLineUp,
      label: 'Dashboard'
    },
    {
      href: '/admin/quizzes',
      icon: ListChecks,
      label: 'Manage Quizzes'
    },
    {
      href: '/admin/quizzes/new',
      icon: PlusCircle,
      label: 'Create Quiz'
    }
  ];

  return (
    <aside 
      className={`bg-card dark:bg-card-dark shadow-custom border-r border-border transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h3 className={`text-xl font-bold text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'
        }`}>
          Dashboard
        </h3>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-full hover:bg-background dark:hover:bg-background-dark text-text dark:text-text-dark"
        >
          {isCollapsed ? (
            <CaretRight size={24} weight="bold" />
          ) : (
            <CaretLeft size={24} weight="bold" />
          )}
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`p-2 rounded flex items-center gap-3 transition-all duration-200 ${isActive(item.href)}`}
                >
                  <Icon size={24} weight="bold" className="flex-shrink-0" />
                  <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isCollapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
} 