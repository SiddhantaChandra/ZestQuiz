'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChartPieSliceIcon, 
  StackIcon, 
  PlusCircleIcon
} from '@phosphor-icons/react';

  const navItems = [
    {
      href: '/admin/dashboard',
    label: 'Dashboard',
    icon: ChartPieSliceIcon,
    },
    {
      href: '/admin/quizzes',
    label: 'Manage Quizzes',
    icon: StackIcon,
    },
    {
      href: '/admin/quizzes/new',
    label: 'Create Quiz',
    icon: PlusCircleIcon,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card dark:bg-card-dark border-r border-border h-screen sticky top-0">
      <nav className="p-4 space-y-1 pt-6">
        {navItems.map((item) => {
          const isActive = 
            item.href === '/admin/quizzes' 
              ? pathname.startsWith(item.href) && !pathname.includes('/new')
              : pathname === item.href;

          return (
            <Link
              key={item.href}
                href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-md font-medium transition-colors duration-75 ${
                isActive
                  ? 'bg-primary/10 text-primary dark:text-primary-light'
                  : 'text-text/70 dark:text-text-dark/70 hover:text-text dark:hover:text-text-dark hover:bg-primary/5 dark:hover:bg-neutral-700'
              }`}
            >
              <item.icon 
                size={22} 
                weight="regular"
                className="flex-shrink-0"
              />
              <span className="text-base">{item.label}</span>
              </Link>
          );
        })}
      </nav>
    </aside>
  );
} 