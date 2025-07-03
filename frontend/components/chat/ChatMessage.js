'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useState } from 'react';

export default function ChatMessage({ message, isUser }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    let interval;
    if (message.isTyping) {
      interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [message.isTyping]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };

  if (message.isTyping) {
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative group`}>
        <div
          className={`
            max-w-[80%] rounded-2xl px-4 py-2
            ${isUser
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100'
            }
          `}
        >
          <div className="flex items-center h-6 px-2">
            <div className={`
              typing-dots
              ${isUser ? 'bg-white' : 'bg-gray-600 dark:bg-gray-400'}
            `} />
            <div className={`
              typing-dots
              ${isUser ? 'bg-white' : 'bg-gray-600 dark:bg-gray-400'}
            `} />
            <div className={`
              typing-dots
              ${isUser ? 'bg-white' : 'bg-gray-600 dark:bg-gray-400'}
            `} />
          </div>
        </div>
        <span className={`text-xs text-gray-500 dark:text-gray-400 absolute bottom-[-18px] ${isUser ? 'right-0' : 'left-0'}`}>
          {formatTime(message.createdAt)}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative group`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg shadow-sm whitespace-pre-line break-words
          ${isUser
            ? 'bg-purple-600 hover:bg-purple-700 transition-colors text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-neutral-800/50 text-gray-900 dark:text-text-dark rounded-bl-none'
          }`
        }
        style={{ wordBreak: 'break-word' }}
      >
        {/* Message content */}
        <div className={`prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${!isUser ? 'dark:prose-invert' : ''}`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap m-0 text-white">{message.content}</p>
          ) : (
            <div className="text-sm whitespace-pre-wrap">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="my-1 text-gray-900 dark:text-gray-100" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base font-bold my-1 text-gray-900 dark:text-gray-100" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-sm font-bold my-1 text-gray-900 dark:text-gray-100" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-1 pl-4 text-gray-900 dark:text-gray-100 space-y-1" {...props} />,
                  ol: ({node, ...props}) => (
                    <ol className="my-1 pl-6 text-gray-900 dark:text-gray-100 space-y-1 list-decimal" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="text-gray-900 dark:text-gray-100 leading-relaxed pl-1" {...props} />
                  ),
                  blockquote: ({node, ...props}) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-neutral-600 pl-4 my-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-neutral-800/50 py-1 rounded" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className={`font-bold ${isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`} {...props} />
                  ),
                  em: ({node, ...props}) => (
                    <em className={`italic ${isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`} {...props} />
                  ),
                  code: ({node, inline, ...props}) => (
                    inline ? 
                    <code className="bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 text-xs px-1.5 py-0.5 rounded font-mono" {...props} /> :
                    <code className="block bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-gray-200 text-xs p-3 rounded font-mono my-2 overflow-x-auto" {...props} />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      <span className={`text-xs text-gray-500 dark:text-gray-400 absolute bottom-[-18px] ${isUser ? 'right-0' : 'left-0'}`}>
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
} 