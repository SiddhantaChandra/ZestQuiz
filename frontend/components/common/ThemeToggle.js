'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from '@phosphor-icons/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-background dark:hover:bg-background-dark transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={20} weight="fill" className="text-text dark:text-text-dark" />
      ) : (
        <Sun size={20} weight="fill" className="text-text dark:text-text-dark" />
      )}
    </button>
  );
} 