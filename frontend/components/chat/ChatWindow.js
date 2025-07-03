'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useChat } from '@/contexts/ChatContext';
import { showErrorToast } from '@/lib/toast';
import { api } from '@/lib/api';

export default function ChatWindow({ attemptId }) {
  const { isChatOpen, updateChatHistory, getChatHistory } = useChat();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);
  const shouldAutoScroll = useRef(true);

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    shouldAutoScroll.current = isAtBottom;
  };

  // Only scroll when new messages are added AND user was already at bottom
  useEffect(() => {
    if (messages.length > prevMessagesLength.current && shouldAutoScroll.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (isChatOpen && attemptId) {
      const loadChatHistory = async () => {
        try {
          const response = await api.get(`/chat/${attemptId}/history`);
          setMessages(response.data);
          updateChatHistory(attemptId, response.data);
          // No forced scroll on initial load
        } catch (error) {
          console.error('Failed to load chat history:', error);
          const cachedMessages = getChatHistory(attemptId);
          if (cachedMessages.length > 0) {
            setMessages(cachedMessages);
          } else if (!isInitialLoad) {
            showErrorToast(error.response?.data?.message || 'Failed to load chat history');
          }
        } finally {
          setIsInitialLoad(false);
        }
      };

      loadChatHistory();
    }
  }, [isChatOpen, attemptId, updateChatHistory, getChatHistory, isInitialLoad]);

  const handleSendMessage = async (content) => {
    try {
      setIsLoading(true);
      shouldAutoScroll.current = true; // Always scroll on user message
      
      // Add user message
      const userMessage = {
        id: 'user-' + Date.now(),
        content,
        isUserMessage: true,
        createdAt: new Date().toISOString(),
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Show typing indicator after a short delay
      setTimeout(() => {
        setIsTyping(true);
      }, 500);

      // Send message to API
      try {
        const response = await api.post(`/chat/${attemptId}/messages`, {
          message: content
      });

        // Hide typing indicator and add AI response
        setIsTyping(false);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: response.data.id,
            content: response.data.content,
        isUserMessage: false,
            createdAt: response.data.createdAt,
          }
        ]);
        updateChatHistory(attemptId, messages);
      } catch (error) {
        console.error('Failed to send message:', error);
        setIsTyping(false);
        showErrorToast(error.response?.data?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to handle message:', error);
      setIsTyping(false);
      showErrorToast('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white dark:bg-neutral-900 rounded-lg shadow-xl flex flex-col border border-gray-200/50 dark:border-neutral-800/50 backdrop-blur-sm z-50">
      {/* Header */}
      <div className="flex-none bg-purple-600 dark:bg-purple-700 text-white p-4 border-b border-purple-500/20">
        <h3 className="text-lg font-semibold">Quiz Assistant</h3>
        <p className="text-sm text-purple-200">Ask me anything about your quiz results</p>
      </div>

      {/* Messages (scrollable area) */}
      <div className="flex-1 min-h-0">
      <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto p-4 space-y-4 bg-white/50 dark:bg-neutral-900/50
            scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 
            dark:scrollbar-thumb-neutral-700 dark:hover:scrollbar-thumb-neutral-600 
            scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-4">
            <p>No messages yet.</p>
            <p className="text-sm mt-2">Try asking about your quiz results!</p>
          </div>
        ) : (
            <>
              {messages.map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              isUser={message.isUserMessage}
            />
              ))}
              {isTyping && (
                <ChatMessage
                  message={{
                    id: 'typing',
                    content: '',
                    isTyping: true,
                    createdAt: new Date().toISOString(),
                  }}
                  isUser={false}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex-none border-t border-gray-200/50 dark:border-neutral-800/50">
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
} 