'use client';

import { Lightning } from '@phosphor-icons/react';

export default function ToggleAiButton({ isAiMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
        isAiMode
          ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg transform hover:scale-105'
          : 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg transform hover:scale-105'
      }`}
    >
      <Lightning size={16} weight="bold" />
      {isAiMode ? 'Manual Mode' : 'AI Assist'}
    </button>
  );
} 