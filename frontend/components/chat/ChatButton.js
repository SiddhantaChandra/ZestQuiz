'use client';

import { useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { MessageCircle } from 'lucide-react';

export default function ChatButton() {
  const { isChatOpen, toggleChat } = useChat();

  useEffect(() => {
  }, [isChatOpen]);

  useEffect(() => {
  }, [isChatOpen]);

  const handleClick = () => {
    toggleChat();
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-10 right-10 p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${
        isChatOpen
          ? 'bg-red-500 hover:bg-red-600 rotate-90 animate-pulse scale-110'
          : 'bg-purple-600 hover:bg-purple-700 animate-float animate-glow hover:scale-110 hover:animate-none'
      }`}
      title={isChatOpen ? 'Close Chat' : 'Open Chat'}
    >
      <MessageCircle className={`w-6 h-6 text-white transition-all duration-300 ${
        isChatOpen ? 'rotate-45' : 'animate-wiggle'
      }`} />
      
      {/* Attention ring animation when closed */}
      {!isChatOpen && (
        <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-75"></div>
      )}
      
      {/* Notification dot */}
      {!isChatOpen && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce">
          <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      )}
    </button>
  );
} 