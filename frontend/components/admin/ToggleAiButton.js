'use client';

import { useState } from 'react';

export default function ToggleAiButton({ isAiMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
        isAiMode
          ? 'bg-purple-600 text-white hover:bg-purple-700'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {isAiMode ? 'Manual Mode' : 'AI Mode'}
    </button>
  );
} 