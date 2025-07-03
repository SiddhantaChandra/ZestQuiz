'use client';

import { useState } from 'react';

export default function ChatInput({ onSend, isLoading }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white/50 dark:bg-neutral-900/50">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your quiz results..."
          className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-neutral-700 
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
            bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            transition-colors duration-200"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            !message.trim() || isLoading
              ? 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
          }`}
        >
          {isLoading ? (
            <div className="w-6 h-6 relative">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
} 