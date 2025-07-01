'use client';

import { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { MessageCircle } from 'lucide-react';

export default function ChatButton() {
  const { isChatOpen, toggleChat } = useChat();

  useEffect(() => {
    // Removed console logs
  }, [isChatOpen]);

  useEffect(() => {
    // Removed console logs
  }, [isChatOpen]);

  const handleClick = () => {
    toggleChat();
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-200 ${
        isChatOpen
          ? 'bg-red-500 hover:bg-red-600 rotate-90'
          : 'bg-purple-600 hover:bg-purple-700'
      }`}
      title={isChatOpen ? 'Close Chat' : 'Open Chat'}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </button>
  );
} 