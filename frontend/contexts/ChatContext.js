'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [windowState, setWindowState] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWindowState = localStorage.getItem('chatWindowState');
      if (savedWindowState) {
        setWindowState(JSON.parse(savedWindowState));
      }

      const savedChatHistory = localStorage.getItem('chatHistory');
      if (savedChatHistory) {
        setChatHistory(JSON.parse(savedChatHistory));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(windowState).length > 0) {
      localStorage.setItem('chatWindowState', JSON.stringify(windowState));
    }
  }, [windowState]);

  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(chatHistory).length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const setAttemptContext = (attemptId) => {
    setCurrentAttemptId(attemptId);
  };

  const updateChatHistory = (attemptId, messages) => {
    setChatHistory(prev => ({
      ...prev,
      [attemptId]: messages
    }));
  };

  const getChatHistory = (attemptId) => {
    return chatHistory[attemptId] || [];
  };

  const value = {
    isChatOpen,
    toggleChat,
    currentAttemptId,
    setAttemptContext,
    updateChatHistory,
    getChatHistory
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 