'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '@/contexts/ChatContext';
import { showErrorToast } from '@/lib/toast';

export default function ChatWindow({ attemptId }) {
  const { isChatOpen, updateChatHistory, getChatHistory } = useChat();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Debug logging
  useEffect(() => {
    // Removed console logs
  }, [isChatOpen, attemptId]);

  useEffect(() => {
    // Removed console logs
  }, [isChatOpen]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen && attemptId) {
      const loadChatHistory = async () => {
        try {
          const response = await fetch(`/api/chat/${attemptId}/history`);
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load chat history');
          }
          const data = await response.json();
          setMessages(data);
          updateChatHistory(attemptId, data);
        } catch (error) {
          // Try to load from local cache if API fails
          const cachedMessages = getChatHistory(attemptId);
          if (cachedMessages.length > 0) {
            setMessages(cachedMessages);
          } else if (!isInitialLoad) {
            // Only show error toast if this isn't the initial load
            showErrorToast(error.message || 'Failed to load chat history');
          }
        } finally {
          setIsInitialLoad(false);
        }
      };

      loadChatHistory();
    }
  }, [isChatOpen, attemptId, updateChatHistory, getChatHistory, isInitialLoad]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content) => {
    try {
      setIsLoading(true);
      
      // Add user message immediately for better UX
      const userMessage = {
        id: 'temp-' + Date.now(),
        content,
        isUserMessage: true,
        createdAt: new Date().toISOString(),
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      updateChatHistory(attemptId, updatedMessages);

      // Add typing indicator
      const typingIndicator = {
        id: 'typing-' + Date.now(),
        content: '...',
        isUserMessage: false,
        isTyping: true,
        createdAt: new Date().toISOString(),
      };
      setMessages([...updatedMessages, typingIndicator]);

      // Send message to API
      const response = await fetch(`/api/chat/${attemptId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Remove typing indicator and add AI response
      const finalMessages = [...updatedMessages, {
        id: data.id,
        content: data.content,
        isUserMessage: false,
        createdAt: data.createdAt,
      }];
      setMessages(finalMessages);
      updateChatHistory(attemptId, finalMessages);
    } catch (error) {
      showErrorToast(error.message || 'Failed to send message');
      // Remove the temporary user message and typing indicator on error
      setMessages(messages);
      updateChatHistory(attemptId, messages);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <h3 className="text-lg font-semibold">Quiz Assistant</h3>
        <p className="text-sm text-purple-200">Ask me anything about your quiz results</p>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            <p>No messages yet.</p>
            <p className="text-sm mt-2">Try asking about your quiz results!</p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.isUserMessage}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
} 